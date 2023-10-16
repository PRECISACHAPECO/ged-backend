const cabecalho = require('../defaults/cabecalho');
const selectRodape = require('../defaults/rodape/index');
const css = require('../defaults/css');
require('dotenv/config');
const urlBase = process.env.BASE_URL;


async function instructionsNewFornecedor(values) {
    // link login e registro enviando cnpj e unidade como parâmetros
    const linkLogin = `${urlBase}/fornecedor/?f=${values.fornecedorID}`;

    let html = `
    <html>`;
    // CSS
    html += css();
    // Body
    html += `
    <body class="body">
        <div class="box">`;
    // Cabeçalho
    html += cabecalho("Avaliação do fornecedor");
    // Conteúdo
    html += `
    <div class="content">`
    // Stages
    html += `
    <div class="boxBorderOff">
        <img style="width: 100%" src="https://gedagro.com.br/images/ged/email/fornecedor/${values.stage}.jpg" />
    </div>
        <p><strong>Olá, ${values.nomeFantasia}!</strong></p>`;
    html += `
                    <div>
                        <p>A partir de agora a nossa comunicação no processo de Qualificação do Fornecedor e nas Não Conformidades no Recebimento de Matéria Prima serão tratadas dentro do sistema GEDagro.</p>
                        <p>Dados para acessar o sistema:</p>
                    </div>
                    <div style="margin-top: 10px;">
                        <p>Link  <br/><a style="font-weight: bold; color: #4c4e64de; "  href="${linkLogin}">${urlBase}fornecedor/?f=${values.fornecedorID}</a></p>
                        <p>Usuário  <br/><strong>${values.cnpjFornecedor}</strong></p>
                        <p>Senha  <br/><strong>${values.senhaFornecedor}</strong></p>
                    </div>
                    <div>
                        <p style="color: red; font-size: 14px">Atenção!  Esta é uma senha gerada automaticamente pelo sistema. Para sua segurança lembre de alterá-la no menu <strong>Meus Dados</strong>.</p>
                    </div>
                    <div>
                        <p>Atenciosamente, <br/>
                            ${values.nomeProfissional} <br/>
                            ${values.cargoProfissional} <br/>
                        </p>
                    </div>
                </div>
            </div>`;
    // Rodapé
    html += selectRodape(values);
    html += `
        </body>
    </html>`;

    return html;
}

module.exports = instructionsNewFornecedor;
