async function generateContent(fornecedorID, unidadeID, a, blocos) {
  let html = `
      <html>
        <head>
          <style>
            h1 {
              font-size: 36px;
              font-weight: bold;
              color: red;
            }
            p {
              font-size: 24px;
              color: green;
            }
          </style>
        </head>
        <body>
          <h1>Relatório recepção</h1>
    `;

  if (blocos) {
    html += `
          <h2>Blocos:</h2>
          <ul>
      `;
    blocos.forEach((bloco) => {
      html += `<li>${bloco.nome}</li>`;
    });
    html += `
          </ul>
      `;
  }

  html += `
          <p>Fornecedor ID: ${fornecedorID}</p>
          <p>Unidade ID: ${unidadeID}</p>
          <p>${a}</p>
        </body>
      </html>
    `;

  return html;
}

module.exports = { generateContent };
