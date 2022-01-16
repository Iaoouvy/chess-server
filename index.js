const axios = require('axios');
// const HTMLParser = require('node-html-parser');
const cheerio = require('cheerio');
const express = require('express')
const app = express()

const getChessData = async () => {
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

    return data
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

app.listen(3000)