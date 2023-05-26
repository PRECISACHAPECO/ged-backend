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
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: Arial, sans-serif;
              height: 100vh;
              margin: 0;
              padding: 0;
              background-color: #f0f0f0;
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
          <h1>Relatório</h1>
          <p>Este é um exemplo de relatório gerado com Puppeteer.</p>
          <script>
            window.open('/api/report-pdf', '_blank');
          </script>
        </body>
      </html>
    `;

        await page.setContent(html);

        const pdfPath = path.join(__dirname, 'relatorio.pdf'); // Caminho para o arquivo PDF gerado

        await page.pdf({ path: pdfPath, format: 'A4' });

        await browser.close();

        res.set('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao gerar o relatório.');
    }
});

// Rota para fornecer o arquivo PDF do relatório
app.get('/api/report-pdf', (req, res) => {
    const pdfPath = path.join(__dirname, 'relatorio.pdf');
    res.sendFile(pdfPath);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
