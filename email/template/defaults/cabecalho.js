const cabecalho = (titulo) => {
    let html = `
    <div class="cabecalho">
        <img src="https://gglasify.sirv.com/logoColorida.png" alt="Ultima" class="logo">

        <h1 class="titulo">
            ${titulo}
        </h1>
    </div>`;
    return html;
};

module.exports = cabecalho;