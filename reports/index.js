const express = require('express');
const routerReports = express.Router();
const urlBase = '/api/relatorio';

const Fornecedor = require('./formularios/fornecedor/generate');
routerReports.post(`${urlBase}/fornecedor/dadosFornecedor`, Fornecedor);

const puppeteer = require('puppeteer');


routerReports.post(`${urlBase}/fornecedor/dadosFornecedor/teste`, async (req, res) => {
    // Inicialize o Puppeteer
    const browser = await puppeteer.launch();

    // Crie uma nova página
    const page = await browser.newPage();

    // Defina o conteúdo do relatório em HTML
    const relatorioHTML = `
          <html>
            <head>
              <title>Relatório</title>
              <style>
                /* Estilos CSS para o relatório */
              </style>
            </head>
            <body>
              <h1>Relatório</h1>
              <!-- Mais conteúdo do relatório -->
            </body>
          </html>
        `;

    // Defina o conteúdo HTML da página
    await page.setContent(relatorioHTML);

    // Gere o arquivo PDF do relatório
    const pdfBuffer = await page.pdf({ format: 'A4' });

    // Feche o navegador Puppeteer
    await browser.close();

    // Envie a resposta com o PDF do relatório
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio.pdf"'
    });
    res.send(pdfBuffer);


});

module.exports = routerReports;
