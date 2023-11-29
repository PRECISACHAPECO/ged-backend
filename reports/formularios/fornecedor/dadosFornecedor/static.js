const db = require('../../../../config/db');

const static = async (data) => {

    sqlFornecedor = `
    SELECT 
    a.*,
    a.nome AS nomeFantasia,
    b.nome AS quemAbriu,
    c.nome AS aprovaProfissional,
    DATE_FORMAT(a.dataInicio, '%d/%m/%Y') AS dataInicio,
    DATE_FORMAT(a.dataInicio, '%H:%i:%s') AS horaInicio,
    DATE_FORMAT(a.dataFim, '%d/%m/%Y') AS dataFim,
    DATE_FORMAT(a.dataFim, '%H:%i:%s') AS horaFim    
FROM fornecedor AS a
JOIN profissional AS b ON (a.profissionalID = b.profissionalID)
LEFT JOIN profissional AS c ON (a.aprovaProfissionalID = c.profissionalID)
WHERE a.fornecedorID = ?;
`
    const [resultSqlFornecedor] = await db.promise().query(sqlFornecedor, [data.id])
    const resultData = resultSqlFornecedor[0]

    const header = [
        {
            'name': 'Quem Abriu',
            'value': resultData.quemAbriu
        },
        {
            'name': 'Data Inicio',
            'value': resultData.dataInicio
        },
        {
            'name': 'Data Fim',
            'value': resultData.dataFim
        },
        {
            'name': 'Hora Inicio',
            'value': resultData.horaInicio
        },
        {
            'name': 'Hora Fim',
            'value': resultData.horaFim
        },
        {
            'name': 'Quem prenche',
            'value': resultData.quemPreenche == 2 ? 'Fornecedor' : 'Fabrica'
        },
        {
            'name': 'Aprova Profissional',
            'value': resultData.aprovaProfissional
        },
        {
            'name': 'Nome Fantasia',
            'value': resultData.nomeFantasia
        },
        {
            'name': 'CNPJ',
            'value': resultData.cnpj
        },
        {
            'email': 'Email',
            'value': resultData.email
        },
        {
            'name': 'Aprova Profissional',
            'value': resultData.aprovaProfissional
        },
        {
            'name': 'Observação',
            'value': resultData.obs,
        },
        {
            'name': 'CEP',
            'value': resultData.cep

        },
        {
            'name': 'Rua',
            'value': resultData.logradouro
        },
        {
            'name': 'Numero',
            'value': resultData.numero
        },
        {
            'name': 'Complemento',
            'value': resultData.complemento
        },
        {
            'name': 'Bairro',
            'value': resultData.bairro
        },
        {
            'name': 'Municipio',
            'value': resultData.cidade
        },
        {
            'name': 'UF',
            'value': resultData.estado
        },

    ]

    const sqlBlocks = `
    SELECT 
        a.parFornecedorModeloBlocoID,
        b.nome AS nomeBloco
    FROM fornecedor_resposta AS a
        LEFT JOIN par_fornecedor_modelo_bloco AS b ON (a.parFornecedorModeloBlocoID = b.parFornecedorModeloBlocoID)
    WHERE a.fornecedorID = ?
    GROUP BY b.parFornecedorModeloBlocoID`;

    const [resultSqlBlocks] = await db.promise().query(sqlBlocks, [data.id]);

    const blocks = [];

    for (const block of resultSqlBlocks) {
        const blockID = block.parFornecedorModeloBlocoID;

        const sqlItensBlock = `
        SELECT 
            b.nome,
            c.resposta
        FROM fornecedor_resposta AS c
        JOIN par_fornecedor_modelo_bloco AS a ON (c.parFornecedorModeloBlocoID = a.parFornecedorModeloBlocoID)
        JOIN item AS b ON (c.itemID = b.itemID)
        
        WHERE c.fornecedorID = ? AND a.parFornecedorModeloBlocoID = ?`;

        const [resultSqlItensBlock] = await db.promise().query(sqlItensBlock, [data.id, blockID]);

        blocks.push({
            nomeBloco: block.nomeBloco,
            itens: resultSqlItensBlock,
        });
    }

    const values = {
        header,
        blocks,
    };


    return values
}

module.exports = static 