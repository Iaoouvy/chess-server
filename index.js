const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv')
const NodeCache = require("node-cache");
const express = require('express')

dotenv.config()
const app = express()
const myCache = new NodeCache({ stdTTL: 180 });

const getChessData = async () => {
    if (myCache.has('chessData')) {
        return myCache.get('chessData')
    } else {
        const response = await axios.get('https://www.chessgames.com/chessecohelp.html');

        const $ = cheerio.load(response.data);
        const codeNames = $('td[valign=TOP] font').toArray().map(ele => ele.children[0].data)
        const moveNames = $('td B').toArray().map(ele => ele.children[0].data)
        const moveValues = $('font[size=-1]').toArray().map(ele => ele.children[0].data)

        const data = codeNames.map((code, idx) => {
            return {
                code: code,
                name: moveNames[idx],
                value: moveValues[idx]
            }
        })
        myCache.set('chessData', data)

        return data
    }
}

app.get('/', async function (req, res) {
    try {
        const data = await getChessData()
        res.send(data)
    } catch (error) {
        console.error(error)
        res.status(400).send({ error: error.message })
    }
})

app.get('/*', async function (req, res) {
    try {
        const params = req.params[0].split("/").filter(n => n)
        const data = await getChessData()
        const code = params.shift()
        const codeData = data.find(ele => ele.code === code)

        if (codeData) {
            if (params.length !== 0) {
                let moves = codeData["value"].split(" ")
                const numRegEx = new RegExp('^[0-9]$');
                moves = moves.filter(ele => !numRegEx.test(ele)) //filter the num indexes in the string

                if (moves.slice(0, params.length).toString() == params.toString()) {
                    //send the next move if sent path is sequential 
                    res.send({ move: moves[params.length] })
                } else {
                    res.status(400).send({ error: "invalid move" })
                }
            } else {
                res.send(codeData)
            }
        } else {
            res.status(400).send({ error: "invalid code" })
        }
    } catch (error) {
        console.error(error)
        res.status(400).send({ error: error.message })
    }
})

app.listen(process.env.PORT || 3000)