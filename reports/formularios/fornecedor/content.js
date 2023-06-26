const cssDefault = require('../../defaults/cssDefault');

const content = (result) => {
    // console.log("🚀 ~ result:", result);
    let html = `
    <html>`;
    //! CSS
    html += cssDefault();
    html += `
        <body>
            <main>
                <h1 class="title" style="padding-bottom: 40px;">Dados do fornecedor</h1>
                <div class="divider"></div>
                <table style="width: 100%;">
                    <tr>`;
    let count = 0;
    //! Laço dos dados dinâmicos do fornecedor
    result.fields.forEach((item, index) => {
        html += `
                        <td style="padding-bottom: 4px;">
                            <span class="titleValues">${item.title}</span><br/>
                            <span class="values">${item.value ?? '--'}</span>
                        </td>`;
        //* Validação para quebrar a linha depois da 3ª coluna
        if (count == 2) {
            html += `
                    </tr>
                        <tr>
                            <td colspan="3" style="border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                    <tr>`;
            count = -1;
        }
        count++;
    });
    html += `
                    </tr>
                </table>
                <div class="divider"></div>`;
    //! Laço das atividades e sistemas de qualidade
    html += `
                <div style="padding-top: 4px;">
                    <p class="titleValues">Atividades: <span class="values">${result.atividades}</span></p>
                    <p class="titleValues" style="padding-top: 6px;">Sistema de qualidade: <span class="values">${result.sistemaQualidade ?? '--'}</span></p>
                </div>`;

    //! Laço dos blocos
    result.blocos.forEach((bloco) => {
        html += `
      <table class="table">
        <thead>
          <tr>
            <th>${bloco.nome}</th>
            <th>Resposta</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>`;
        //! Itens dos blocos
        bloco.itens.forEach((item) => {
            html += `
        <tr>
          <td>
            <span>${item.ordem} - </span>${item.nome}
          </td>
          <td>${item.resposta ? item.resposta : ''}</td>
          <td>${item.obsResposta ? item.obsResposta : ''}</td>
        </tr>`;
        });
        html += ` 
        </tbody>
      </table>`;
    });

    //! Assinatura Rodapé
    html += `
            <div style="padding-top: 40px;">
                <h1 class="title" style="font-size: 16px; width: 50%; margin: 0 auto; border-top: 1px solid black">Assinatura do profissional</h1>
            </div>
            </main>
        </body>
    </html>`;
    return html;
};

module.exports = content;
