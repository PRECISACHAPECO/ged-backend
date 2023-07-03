const express = require('express');
const routerReports = express.Router();
const urlBase = '/api/relatorio';

const Fornecedor = require('./formularios/fornecedor/generate');
routerReports.post(`${urlBase}/fornecedor/dadosFornecedor`, Fornecedor);


// //! pdfkit /  meçlhor opção fora Puppeteer
// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const pdf = require('html-pdf');

// routerReports.post(`/teste2`, (req, res) => {
//   const relatorioHTML = `
//     <html>
//       <head>
//         <title>Relatório</title>
//         <style>
//           /* Estilos CSS para o relatório */
//         </style>
//       </head>
//       <body>
//         <h1>Relatório</h1>
//         <p>euuuithjrtuhrtjkrthnjkrtnçm,nrjknfgjkrgnçjkgn gm,ef gmw çtklrentjrçntjkrtnmrlçkjrtrtrt</p>
//         <p>euuuithjrtuhrtjkrthnjkrtnçm,nrjknfgjkrgnçjkgn gm,ef gmw çtklrentjrçntjkrtnmrlçkjrtrtrt</p>
//         <p>euuuithjrtuhrtjkrthnjkrtnçm,nrjknfgjkrgnçjkgn gm,ef gmw çtklrentjrçntjkrtnmrlçkjrtrtrt</p>
//         <p>euuuithjrtuhrtjkrthnjkrtnçm,nrjknfgjkrgnçjkgn gm,ef gmw çtklrentjrçntjkrtnmrlçkjrtrtrt</p>
//         <p>euuuithjrtuhrtjkrthnjkrtnçm,nrjknfgjkrgnçjkgn gm,ef gmw çtklrentjrçntjkrtnmrlçkjrtrtrt</p>
//         <p>euuuithjrtuhrtjkrthnjkrtnçm,nrjknfgjkrgnçjkgn gm,ef gmw çtklrentjrçntjkrtnmrlçkjrtrtrt</p>
//         <p>euuuithjrtuhrtjkrthnjkrtnçm,nrjknfgjkrgnçjkgn gm,ef gmw çtklrentjrçntjkrtnmrlçkjrtrtrt</p>

//         <!-- Mais conteúdo do relatório -->
//       </body>
//     </html>
//   `;

//   // Gerar o PDF a partir do HTML usando o html-pdf
//   pdf.create(relatorioHTML).toStream((err, stream) => {
//     // Definir o cabeçalho da resposta com o PDF do relatório
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename="relatorio.pdf"');

//     // Transmitir o conteúdo do PDF para a resposta HTTP
//     stream.pipe(res);
//   });
// });










//! Puppeteer
const puppeteer = require('puppeteer');
routerReports.post(`/teste2`, async (req, res) => {
  const chromiumPath = '/home/gedagroc/.local/bin:/home/gedagroc/bin:/usr/local/cpanel/3rdparty/lib/path-bin:/usr/share/Modules/bin:/usr/local/cpanel/3rdparty/lib/path-bin:/usr/local/jdk/bin:/usr/kerberos/sbin:/usr/kerberos/bin:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin:/usr/X11R6/bin:/usr/local/bin:/usr/X11R6/bin:/root/bin:/opt/bin:/opt/cpanel/composer/bin';
  // Inicialize o Puppeteer
  // const browser = await puppeteer.launch({ executablePath: chromiumPath });
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
