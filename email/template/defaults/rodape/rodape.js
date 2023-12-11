const rodape = (values) => {
    let html = `
    <div class="box rodape">
        <p class="textSmall">Este é um e-mail automático, não responda.</p>
            <p style="font-size: 14px;">${values.nomeFantasiaFabrica ?? ''}<br/>
             ${values.enderecoCompletoFabrica ?? ''}</p>
    </div>`;
    return html;
};

module.exports = rodape;