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
        console.error(error);
    }
})

app.get('/:code', async function (req, res) {
    try {
        const { code } = req.params
        const data = await getChessData()

        const codeData = data.find(ele => ele.code === code)

        res.send(codeData)
    } catch (error) {
        console.error(error);
    }
})

app.listen(process.env.PORT || 3000)