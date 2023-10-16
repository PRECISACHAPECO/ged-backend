const rodape = (values) => {
    let html = `
    <div class="box rodape">
        <p class="textSmall">Este é um e-mail automático, não responda.</p>
        <div>
            <p class="superSmall">${values.nomeFantasiaFabrica}<br/>
             ${values.enderecoCompletoFabrica}</p>
        </div>
    </div>`;
    return html;
};

module.exports = rodape;