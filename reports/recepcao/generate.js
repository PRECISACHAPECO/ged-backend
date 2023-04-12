const puppeteer = require('puppeteer');
const db = require('../../config/db');
const { generateContent } = require('./content');

async function reportRecepcao(req, res) {
    const { fornecedorID, unidadeID } = req.body;

    let a = 22;

    const [blocos] = await db.promise().query(`SELECT * FROM par_fornecedor_bloco a WHERE a.unidadeID = ? `, [unidadeID]);

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const html = await generateContent(fornecedorID, unidadeID, a, blocos);
        await page.setContent(html);

        const pdfBuffer = await page.pdf();
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao gerar relatório');
    }
}

module.exports = { reportRecepcao };
