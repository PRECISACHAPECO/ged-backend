const cabecalho = require('../defaults/cabecalho');
const rodape = require('../defaults/rodape');


async function NewPassword(password, type, nome) {
    let link = type == 'login' ? 'https://demo.gedagro.com.br/login' : 'https://demo.gedagro.com.br/fornecedor';
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
                z-index: -1;
          }
          .titulo{
            font-size: 20px;
            font-weight: bold;
            color: #E5E5E5;
          }
          .logo{
            width: 120px;
            height: auto;
            z-index: 9999;
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
            .textBold{
                font-weight: bold;
            }
          .link{
            color: #5A5FE0;
            font-weight: bold;
            font-height: 1.5;
          }
          .linkRodape{
            text-decoration : none;
            color: #4c4e64de;
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
    html += cabecalho("Solicitação de nova senha");
    // Conteúdo
    html += `
                <div class="content">
                    <h1>Olá ${nome},</h1>
                    <p class="text">Sua nova senha é ${password}</p>
                    <span class="text">Acesse o link para acessar o sistema: <a class="link" href=${link}>GED</a> </span>
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

module.exports = NewPassword;
