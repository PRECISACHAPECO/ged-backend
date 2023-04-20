async function generateContent(
  resultData,
  resultBlocos,
  data
) {
  let html = `
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css"
        />
        <style>
          .fontBaseTitle {
            font-size: 10px;
            font-weight: bold;
          }
          .fontBase {
            font-size: 14px;
          }
          .divider {
            border-bottom: 1px solid #9ca3af;
            opacity: 0.2;
          }
          .padding {
            padding: 8px;
          }
        </style>
      </head>
      <body>`;
  //  Cabeçalho 
  html += `
        <h1 class="text-lg font-bold text-center">
          QUESTIONÁRIO DE RECEBIMENTO DE MP
        </h1>

        <div class="divider mt-10"></div>
        <div class="grid grid-cols-3 padding">`;

  let contador = 0;
  resultData.forEach((row) => {
    if (contador % 3 === 0 && contador > 0) {
      html += `
        </div>
        <div class="divider"></div>
        <div class="grid grid-cols-3 padding">`;
    }
    html += `
          <div class="pt-1 col-span-1">
            <p class="fontBaseTitle">${row.title}</p>
            <p class="fontBase">${row.value}</p>
          </div>`;
    contador++;
  });

  // Fecha laço dos dados dinamicos do fornecedor
  html += `
        </div>`;

  //  Tabela com os blocos
  resultBlocos.forEach((bloco) => {
    html += `
        <table class="table-auto w-full mt-4">
          <thead>
            <tr class="bg-gray-100">
              <th class="border px-2 py-2 fontBaseTitle text-left">${bloco.nome}</th>
              <th class="border px-2 py-2 fontBaseTitle">Resposta</th>
              <th class="border px-2 py-2 fontBaseTitle">Observações</th>
            </tr>
          </thead>
          <tbody>`;
    //  Itens dos blocos
    bloco.itens.forEach((item) => {
      html += `
            <tr>
              <td class="border px-2 py-2 text-xs"><span class="opacity-80">${item.ordem} - </span>${item.nome}</td>
              <td class="border px-2 py-2 text-xs">${item.resposta ? item.resposta : ''}</td>
              <td class="border px-2 py-2 text-xs">${item.obsResposta ? item.obsResposta : ''}</td>
            </tr>`;
    });
    html += ` 
          </tbody>
        </table>`;
  });

  html += `
    <p class="mt-10" >Observações: ${data[0].obs}</p>`;


  // Assinatura Rodapé

  html += `
    <p class="text-center mx-auto mt-28 w-3/6" style = "border-top: 1px solid black"> Assinatura do profissional</p>
      </body>
    </html>
    `;
  // Retorna os dados em html para serem renderizados no pdf pelo puppeteer no arquivo generate.js
  return html;
}

module.exports = { generateContent, };
