const cabecalho = require('../defaults/cabecalho');
const rodape = require('../defaults/rodape');


async function NewPassword(nome, id, type) {
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
        .title{
          color: #4c4e64de;
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
          .textSmall{
            font-size: 12px;
            line-height: 1.5;
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
  html += cabecalho("REDEFINIR SENHA");
  // Conteúdo
  html += `
                <div class="content">
                    <h1 class="title">Olá ${nome},</h1>
                    <p class="text">Recebemos uma solicitação para redefinir a senha da sua conta. Para prosseguir com a redefinição, siga as instruções abaixo:</p>
                    <p class="text">Clique no link abaixo para acessar a página de redefinição de senha: </p>
                    <p class="text"><a class="link" href="http://localhost:3000/redefinir-senha?userId=${id}&type=${type}">Redefinir senha</a></p>
                    <p class="text">Na página de redefinição de senha, você será solicitado a fornecer uma nova senha.</p>
                    <p class="text">Caso você não tenha solicitado a redefinição de senha, recomendamos que você tome as seguintes medidas imediatamente:</p>
                    <ul class="text">
                      <li>Verifique se a sua conta está protegida com uma senha forte e exclusiva.</li>
                      <li>Não compartilhe sua senha com ninguém.</li>
                      <li>Mantenha seus dispositivos e contas seguros, atualizando-os regularmente e evitando acesso não autorizado.</li>
                    </ul>
                    <p class="text">Se você tiver alguma dúvida ou precisar de assistência adicional, entre em contato com o nosso suporte ao cliente.</p>
                    <p class="text">Atenciosamente, <br/> 
                    Equipe GEDagro.
                    </p>
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
