const rodapeNoFactory = () => {
    let html = `
    <div class="box rodape">
        <p class="textSmall">Este é um e-mail automático, não responda.</p>
        <div>
            <a  href="https://gedagro.com.br/" class="superSmall">Gedagro - Gerenciamento Eletrônico de Documentos</a><br/>
            <span class="superSmall">Rua Minas Gerais, 533, Sala 206 - 89801-200 - Chapecó - SC</span>
        </div>
    </div>`;
    return html;
};

module.exports = rodapeNoFactory;