const css = () => {
    // cor padrão do sistema
    let css = `
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@400;500;600;800&display=swap');
            .body {
                background-color: #E5E5E5;
                padding: 0px;
                margin: 0px;
                box-sizing: border-box;
                font-family: 'Inter', sans-serif;
            }
            .title{
                text-color: #27272A;
            }
            .box{
                box-sizing: border-box;
                width: min(800px, 100%);
                margin: 0 auto;
                border: 1px solid #f1f1f1;
                background-color: #fff;
            }
            .cabecalho {
                background-color: #35553b;
                padding: 25px;
                z-index: -1;
            }
            .titulo{
                font-size: 20px;
                font-weight: bold;
                color: #E5E5E5;
            }
            .logo{
                width: 120px;
                height: auto;
                z-index: 9999;  
            }
            .content{
                padding: 25px;
                background-color: #fff;
            }`;
    // Texto tamanho padrão
    css += `
            p, ul, text{
                font-size: 16px;
                line-height: 1.5;
                color: #4c4e64de;
            }`;
    // Texto tamanho pequeno
    css += `
            .textSmall{
                font-size: 14px;
                line-height: 1.5;
                color: #4c4e64de;
            }`;
    // Texto tamanho bem  pequeno
    css += `
            .superSmall{
                font-size: 12px;
                line-height: 1.5;
                color: #4c4e64de;
            }
            .rodape{
                background-color: #fffbfb4a;
                padding: 25px;
            }
        </style>
    </head>
    `;
    return css;
};

module.exports = css;