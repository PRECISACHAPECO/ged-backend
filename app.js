const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3333;

app.use(express.json());
app.use(cors());

// Rota para gerar o relatório
app.get('/api/report', async (req, res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            h1 {
              color: #333;
            }
            p {
              color: #777;
            }
          </style>
        </head>
        <body>
        <div style="display: flex; background-color: red;">
        <h1>Relatório</h1>
        <p>Este é um exemplo de relatório gerado com Puppeteer.</p>
        </div>
        </body>
      </html>
    `;

        await page.setContent(html);

        const pdfPath = path.join(__dirname, 'relatorio.pdf'); // Caminho para o arquivo PDF gerado

        await page.pdf({ path: pdfPath, format: 'A4' });

        await browser.close();

        const pdfBuffer = fs.readFileSync(pdfPath);
        fs.unlinkSync(pdfPath); // Remover o arquivo PDF após lê-lo

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="relatorio.pdf"',
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao gerar o relatório.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
