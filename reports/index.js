const express = require('express');
const routerReports = express.Router();
const urlBase = '/api/relatorio';

// const pdf = require('html-pdf-node');
// const fs = require('fs');

const Fornecedor = require('./formularios/fornecedor/generate');
routerReports.post(`${urlBase}/fornecedor/dadosFornecedor`, Fornecedor);

// routerReports.post(`${urlBase}/fornecedor/dadosFornecedor/teste`, async (req, res) => {
//     const html = `
//     <html>
//       <head>
//         <style>
//           @page {
//             margin: 2cm; /* Margens de 2 centímetros em todas as direções */
//           }

//           header {
//             position: fixed; /* Mantém o cabeçalho fixo em todas as páginas */
//             top: 1cm;
//             left: 2cm;
//             right: 2cm;
//           }

//           footer {
//             position: fixed; /* Mantém o rodapé fixo em todas as páginas */
//             bottom: 1cm;
//             left: 2cm;
//             right: 2cm;
//             text-align: center;
//           }

//           footer::after {
//             content: counter(page) " de " counter(pages); /* Insere a numeração da página */
//           }
//         </style>
//       </head>
//       <body>
//         <header>
//           <h1>Cabeçalho do Relatório</h1>
//         </header>
//         <main>
//           <h2>Relatório</h2>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//             <p>Conteúdo do relatório</p>
//         </main>
//         <footer></footer>
//       </body>
//     </html>
//   `;

//     const options = {
//         format: 'A4',
//         margin: {
//             top: '2cm',
//             right: '2cm',
//             bottom: '2cm',
//             left: '2cm',
//         },
//         displayHeaderFooter: true,
//         headerTemplate: '<div></div>',
//         footerTemplate: '<div style="text-align: center; font-size: 10px;"><span class="pageNumber"></span> de <span class="totalPages"></span></div>',
//     };

//     const file = { content: html };

//     try {
//         const pdfBuffer = await pdf.generatePdf(file, options);
//         res.set({
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': 'inline; filename="relatorio.pdf"',
//         });
//         res.send(pdfBuffer);
//     } catch (error) {
//         console.error('Erro ao gerar o relatório PDF:', error);
//         res.status(500).send('Erro ao gerar o relatório PDF.');
//     }
// });

module.exports = routerReports;
