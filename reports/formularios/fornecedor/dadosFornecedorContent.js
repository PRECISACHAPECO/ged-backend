const cssDefault = require('../../defaults/cssDefault');

const dadosFornecedorContent = (result) => {
    console.log("🚀 ~ result:", result)
    let html = `
    <html>`;
    // CSS
    html += cssDefault();
    html += `
        <body>
            <main>
                <h1 class="title">Dados do fornecedor ${result.fornecedorID}</h1>
                <table style="width: 100%;">
                    <tr>`
    let count = 0
    result.fields.forEach((element, index) => {
        html += `
        <td >ccc</td>`

        //* Validação pra quebrar linha depois da 3ª coluna
        if (count == 2) { html += `</tr><tr><td colspan="3" style="border-top: 1px solid black;"></td></tr><tr>`; count = -1; } count++;
    });
    html += `
                        
                    </tr>
                </table>
            </main>
        </body>
    </html>
    `;
    return html;
}

module.exports = dadosFornecedorContent;
