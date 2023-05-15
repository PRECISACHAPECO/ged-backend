const cabecalho = require('../../defaults/cabecalho');
const rodape = require('../../defaults/rodape');

async function instructionsNewFornecedor() {
  let html = `
      <html>
      <head>
      <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;600;800&display=swap');
          .body {
            background-color: #E5E5E5;
            padding: 0px;
            margin: 0px;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }
        .box{
              box-sizing: border-box;
              width: min(800px, 100%);
              margin: 0 auto;
              border: 1px solid #f1f1f1;
              background-color: #fff;
            }
            .cabecalho {
                background-color: #5A5FE0;
                padding: 25px;
          }
          .titulo{
            font-size: 20px;
            font-weight: bold;
            color: #E5E5E5;
          }
          .logo{
            width: 70px;
            height: 70px;
            background-color: green;
          }
          .content{
            padding: 25px;
            background-color: #fff;
          }
          .text{
            font-size: 16px;
            line-height: 1.5;
            color: #4c4e64de;
          }
          .textMedium{
            font-size: 14px;
            line-height: 1.5;
            color: #4c4e64de;
          }
          .textSmall{
            font-size: 12px;
            line-height: 1.5;
            color: #4c4e64de;
            }
          .link{
            color: #5A5FE0;
            font-weight: bold;
            font-height: 1.5;
          }
            .rodape{
                background-color: #fffbfb4a;
                padding: 25px;
            }
        </style>
    </head>
        <body class="body">
            <div class="box">`;
  // Cabeçalho
  html += cabecalho("Instruções para o fornecedor");
  // Conteúdo
  html += `
                <div class="content">
                    <p class="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                    <span class="text">Acesse o link para se cadastrar: <a class="link" href="https://demo.gedagro.com.br/login">GED</a> </span>
                </div>
            </div>`;
  // Rodapé
  html += rodape();
  html += `
        </body>
      </html>
    `;
  return html;
}

module.exports = instructionsNewFornecedor;
