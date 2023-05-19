const cabecalho = require('../../defaults/cabecalho');
const rodape = require('../../defaults/rodape');
const css = require('../../defaults/css');
require('dotenv/config');
const urlBase = process.env.BASE_URL;

async function instructionsNewFornecedor(cnpj, unidade) {
    // link login e registro enviando cnpj e unidade como parâmetros
    const linkLogin = `${urlBase}/fornecedor/?c=${cnpj}&u=${unidade}`;
    const linkRegistro = `${urlBase}/registro/?c=${cnpj}&u=${unidade}`;
    let html = `
    <html>`;
    // CSS
    html += css();
    // Body
    html += `
        <body class="body">
            <div class="box">`;
    // Cabeçalho
    html += cabecalho("INSTRUÇÕES PARA O FORNECEDOR");
    // Conteúdo
    html += `
                <div class="content">
                    <h1 class="title">Caro fornecedor,</h1>
                    <p>Gostaríamos de solicitar que você faça o seu cadastro em nosso sistema para estabelecermos uma parceria comercial. Para isso, pedimos que acesse o link para realizar o primeiro cadastro: </p>
                    <p><a class="link" href=${linkRegistro}>Primeiro cadastro</a></p>
                    <p>Caso já tenha realizado o cadastro anteriormente, você pode simplesmente acessar o link de login:</p>
                    <p><a class="link" href=${linkLogin}>Login</a></p>
                    <p>O cadastro em nosso sistema é fundamental para que possamos agilizar o processo de comunicação e facilitar a realização de transações comerciais entre nós. É importante que você preencha todos os campos necessários de forma correta e completa.</p>
                    <p>Se tiver alguma dúvida ou dificuldade durante o processo de cadastro, entre em contato com nossa equipe de suporte, que estará pronta para ajudá-lo.</p>
                    <p>Agradecemos pela sua atenção e estamos ansiosos para iniciar uma parceria bem-sucedida.</p>
                    <p>Atenciosamente, <br/> 
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

module.exports = instructionsNewFornecedor;
