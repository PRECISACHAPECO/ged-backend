const cabecalho = (titulo) => {
    let html = `
    <div class="cabecalho">
        <img src="https://gedagro.com.br/images/logoBranca.png" alt="GED - Gestão Eletrônica de Documentos" class="logo">
        <h1 class="titulo">
            ${titulo}
        </h1>
    </div>`;
    return html;
};

module.exports = cabecalho;