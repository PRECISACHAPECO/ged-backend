const cabecalho = require("../../defaults/cabecalho");
const css = require("../../defaults/css");
const rodape = require("../../defaults/rodape/rodape");


async function fornecedorPreenche(values) {
    let html = `
    <html>`;
    // CSS
    html += css();
    html += `
        <body class="body">
            <div class="box">`;
    // Cabeçalho
    html += cabecalho("PREENCHIMENTO DE NÃO CONFORMIDADE");
    // Conteúdo
    html += `
                <div class="content">
                  <h1>Ola formnecedorrrr</h1>
                </div>
            </div>`;
    // Rodapé
    html += await rodape(values);

    html += `
        </body>
    </html>
    `;
    return html;
}

module.exports = fornecedorPreenche;
