const cssDefault = () => {
    // cor padrão do sistema
    let cssDefault = `
    <head>
        <style>
            *{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                list-style: none;
                text-decoration: none;
            }
            body {
                margin: 10px 7px;
                font-family: roboto, sans-serif;
            }
            .title{
                text-color: #27272A;
                font-size: 26px;
                font-weight: bold;
                text-align: center;
            }
            /* Estilos da tabela */
            .custom-table {
                border-collapse: collapse;
                width: 100%;
            }

            .custom-table thead {
                background-color: #f2f2f2;
            }

            .custom-table th,
            .custom-table td {
                border: 1px solid black;
                padding: 8px;
            }
        </style>
    </head>
    `;
    return cssDefault;
};

module.exports = cssDefault;
