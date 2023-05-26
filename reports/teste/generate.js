const puppeteer = require('puppeteer');
const db = require('../../config/db');
const { generateContent } = require('./content');

async function teste(req, res) {

    try {
        const browser = await puppeteer.launch({ headless: 'new' });

        const page = await browser.newPage();

        const html = await generateContent();
        await page.setContent(html);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="meu_relatorio.pdf"`);

        const pdfBuffer = await page.pdf({});
        await browser.close();


        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao gerar relatório');
    }
}

module.exports = { teste };
