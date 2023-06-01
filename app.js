const express = require('express');
const cors = require('cors');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');

app.use(express.json());
app.use(cors({ origin: '*' }));

// Rota para criar o PDF
app.post('/api/pdf', async (req, res) => {
  try {
    await createPdf();

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Rota para fazer o download do PDF
app.get('/api/pdf/download', (req, res) => {
  const filePath = 'report.pdf';

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.sendStatus(404);
  }
});

// Função para criar o PDF usando Puppeteer
async function createPdf() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body>
      <div class="p-4 bg-blue-500 text-white">
        Hello, World!
      </div>
    </body>
    </html>
  `);

  await page.pdf({ path: 'report.pdf' });

  await browser.close();
}


// Gerar pdf






// Rota para criar o PDF
app.post('/api/pdf/gerar', async (req, res) => {
  try {
    const pdfBuffer = await createPdf();

    // Define o cabeçalho Content-Type para indicar que é um arquivo PDF
    res.setHeader('Content-Type', 'application/pdf');

    // Envia o buffer do PDF como resposta
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Função para criar o PDF usando Puppeteer
async function createPdf() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body>
      <div class="p-4 bg-blue-500 text-white">
        Hello, World!yttytytyytytyt
      </div>
    </body>
    </html>
  `);

  const pdfBuffer = await page.pdf();

  await browser.close();

  return pdfBuffer;
}

app.listen(3333, () => {
  console.log('Server is running on port 3333');
});
