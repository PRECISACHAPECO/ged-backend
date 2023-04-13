const puppeteer = require('puppeteer');
const db = require('../../config/db');
const { generateContent } = require('./content');

async function reportRecepcao(req, res) {
    const { fornecedorID, unidadeID } = req.body;

    let a = 22;

    const [blocos] = await db
        .promise()
        .query(`SELECT * FROM par_fornecedor_bloco a WHERE a.unidadeID = ? `, [unidadeID]);

    const totalPages = 1; // Número total de páginas do relatório

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const html = await generateContent(fornecedorID, unidadeID, a, blocos);
        await page.setContent(html);

        const pageSize = 'A4'; // Tamanho da página
        const margin = {
            top: '1cm',
            bottom: '1cm',
            left: '1cm',
            right: '2cm',
        }; // Margens da página

        // Renderiza cada página e adiciona a numeração de página correspondente
        for (let i = 1; i <= totalPages; i++) {
            const header = `<div style="position: absolute; top: 0; left: 0; right: 0; height: 1cm; text-align: center;">Página ${i} de ${totalPages}</div>`;
            const footer = `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1cm; text-align: center;">Exemplo de rodapé</div>`;

            await page.pdf({
                format: pageSize,
                margin,
                displayHeaderFooter: true,
                headerTemplate: header,
                footerTemplate: footer,
                pageRanges: `${i}`,
                printBackground: true,
            });
        }

        const pdfBuffer = await page.pdf({
            format: pageSize,
            margin,
            printBackground: true,
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao gerar relatório');
    }
}

module.exports = { reportRecepcao };
