async function generateContent(
    fornecedorID,
    unidadeID,
    blocos,
    resultData,
    atividades,
    sistemaQualidade,
    resultBlocos
) {
    let html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Questionário de Auto Avaliação do Fornecedor</title>
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
      <body>
        <!-- Cabeçalho -->
        <h1 class="text-lg font-bold text-center bg-red-600">
          QUESTIONÁRIO DE AUTO AVALIAÇÃO DO FORNECEDOR
        </h1>

        <div class="divider mt-10"></div>
        <div class="grid grid-cols-3 padding">`;

    let contador = 0;
    resultData.forEach((row, i) => {
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

    html += `
        </div>
      
        <div class="divider"></div>
    <div class="grid grid-cols-1 padding">
      <div class="pt-1">
        <p class="fontBaseTitle">Atividades</p>
        <p class="fontBase"> ${atividades[0].atividade}</p>
      </div>
    </div>
    <div class="divider"></div>
    <div class="grid grid-cols-1 padding">
      <div class="pt-1">
        <p class="fontBaseTitle">Sistemas de qualidade</p>
        <p class="fontBase"> ${sistemaQualidade[0].sistemaQualidade}</p>
      </div>
    </div>`;


    //  Tabela com os blocos 
    resultBlocos.forEach((row, i) => {
        html += ` <table class="table-auto w-full mt-4">
          <thead>
            <tr class="bg-gray-100">
              <th class="border px-2 py-2 fontBaseTitle text-left">
                < row.nome 
              </th>
              <th class="border px-2 py-2 fontBaseTitle">Resposta</th>
              <th class="border px-2 py-2 fontBaseTitle">Observações</th>
            </tr>
          </thead>
          <tbody>`;
        //  Itens dos blocos 
        row.itens.forEach((item, i) => {
            html += ` <tr>
              <td class="border px-2 py-2 text-xs">${item.nome}</td>
              <td class="border px-2 py-2 text-xs">${item.resposta}</td>
              <td class="border px-2 py-2 text-xs">${item.obsResposta}</td>
            </tr>`;
        });
        html += ` </tbody>
        </table>`;
    });






    html += ` </body>
    </html>
  `;

    return html;
}

module.exports = { generateContent };
