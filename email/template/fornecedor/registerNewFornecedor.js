const cabecalho = require('../defaults/cabecalho');
const selectRodape = require('../defaults/rodape/index');
const css = require('../defaults/css');
require('dotenv/config');
const urlBase = process.env.BASE_URL;


async function registerNewFornecedor(values) {
    // link login e registro enviando cnpj e unidade como parâmetros
    const linkLogin = `${urlBase}/fornecedor/`;
    let html = `
    <html>`;
    // CSS
    html += css();
    // Body
    html += `
    <body class="body">
        <div class="box">`;
    // Cabeçalho
    html += cabecalho("REGISTRO EFETUADO COM SUCESSO");
    // Conteúdo
    html += `
      <div class="content">`
    // Stages
    html += `
      <div class="boxBorderOff">
          <img style="width: 100%" src="https://gedagro.com.br/images/ged/email/fornecedor/${values.stage}.jpg" />
      </div>
          <h1 class="title">Olá, ${values.data.nomeFornecedor}!</h1>`;
    html += `
                      <p>Cadastro realizado com sucesso!</p>
                      <p>Para acessar o sistema acesse <a href="${linkLogin}">link</a></p>

              </div>`;
    // Rodapé
    html += selectRodape(values);
    html += `
        </body>
    </html>`;

    return html;
}

module.exports = registerNewFornecedor;
