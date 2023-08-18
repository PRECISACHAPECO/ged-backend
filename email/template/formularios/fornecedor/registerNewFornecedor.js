const cabecalho = require('../../defaults/cabecalho');
const rodape = require('../../defaults/rodape');
const css = require('../../defaults/css');
require('dotenv/config');
const urlBase = process.env.BASE_URL;


async function registerNewFornecedor(values) {
    // link login e registro enviando cnpj e unidade como parâmetros
    const linkLogin = `${urlBase}/fornecedor/?c=${values.cnpj}&u=${values.unidadeID}`;
    const linkRegistro = `${urlBase}/registro/?c=${values.cnpj}&u=${values.unidadeID}&n=${encodeURIComponent(values.nomeFornecedor)}&e=${values.destinatario}`;

    let html = `
    <html>`;
    // CSS
    html += css();
    // Body
    html += `
    <body class="body">
        <div class="box">`;
    // Cabeçalho
    html += cabecalho("AVALIAÇÃO DO FORNECEDOR");
    // Conteúdo
    html += `
    <div class="content">`
    // Stages
    html += `
    <div class="boxBorderOff">
        <img style="width: 100%" src="https://gedagro.com.br/images/ged/email/fornecedor/${values.stage}.jpg" />
    </div>
        <h1 class="title">Olá, ${values.nomeFornecedor}!</h1>`;
    html += `
                    <div>
                        <p>Somos da ${values.nomeFabricaSolicitante}, empresa sediada em ${values.enderecoSimplificadoFabricaSolicitante}, gostaríamos de solicitar o cadastro de sua empresa em nosso sistema para estabelecermos uma parceria comercial.</p>
                        <p>Para isso, pedimos que acesse o <a href=${linkRegistro}>link</a> para realizar o primeiro cadastro.</p>
                        <p>Você será direcionado para um site seguro e fará o acesso usando CNPJ e senha.</p>
                    </div>
                    <div>
                    <p>Em caso de dúvidas, entre em contato com dados do responsável da empresa.</p>
                    </div>
                </div>
            </div>`;
    // Rodapé
    html += rodape(values);
    html += `
        </body>
    </html>`;

    return html;
}

module.exports = registerNewFornecedor;
