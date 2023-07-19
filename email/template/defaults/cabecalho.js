const cabecalho = (titulo) => {
    let html = `
    <div class="cabecalho">
        <img src="https://i.postimg.cc/wMS7M6Dc/logo-Final-Cor.png" alt="Ultima" class="logo">
        <h1 class="titulo">
            ${titulo}
        </h1>
    </div>`;
    return html;
};

module.exports = cabecalho;