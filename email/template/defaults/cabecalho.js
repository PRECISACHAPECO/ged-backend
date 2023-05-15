const cabecalho = (titulo) => {
    let html = `
    <div class="cabecalho">
        <img class="logo" src="https://blog.abler.com.br/wp-content/uploads/2021/06/teste-de-perfil-comportamental-1-e1660663169829.jpg" alt="logo" >
        <h1 class="titulo">
            ${titulo}
        </h1>
    </div>`;
    return html;
};

module.exports = cabecalho;