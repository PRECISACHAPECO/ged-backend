async function generateContent(fornecedorID, unidadeID, blocos, resultData, atividades, sistemaQualidade) {
  let html = `
      <html>
        <head>
        <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css"
        />
          <style>
            p {
              font-size: 24px;
              color: green;
            }
          </style>
        </head>
        <body>
          <h1 class="text-5xl text-green-600">Relatório</h1>
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
        </body>
      </html>
    `;

  return html;
}

module.exports = { generateContent };
