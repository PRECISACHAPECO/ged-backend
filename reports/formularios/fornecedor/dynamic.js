const db = require("../../../config/db");

async function dynamic(data, modelo) {
    const resultData = [];
    // Fields header fixos
    const sqlFornecedorFixos = `
    SELECT a.* FROM fornecedor AS  a WHERE a.fornecedorID = ?`
    const [resultSqlFornecedor] = await db.promise().query(sqlFornecedorFixos, [data.fornecedorID])

    const header = [
        {
            'name': 'CNPJ',
            'value': resultSqlFornecedor[0].cnpj
        },
        {
            'name': 'Nome Fantasia',
            'value': resultSqlFornecedor[0].nome
        },
        {
            'name': 'Razao Social',
            'value': resultSqlFornecedor[0].razaoSocial
        }
    ]

    resultData.push(...header)

    // Fields header dinamicos
    const sqlFornecedor = `
    SELECT *
            FROM par_fornecedor AS pf 
                LEFT JOIN par_fornecedor_modelo_cabecalho AS pfmc ON (pf.parFornecedorID = pfmc.parFornecedorID)
            WHERE pfmc.parFornecedorModeloID = ?
            ORDER BY pfmc.ordem ASC`
    const [colunsFornecedor] = await db.promise().query(sqlFornecedor, [modelo]);

    const columns = colunsFornecedor.map(row => row.nomeColuna);
    const titleColumns = colunsFornecedor.map(row => row.nomeCampo);
    const titleTable = colunsFornecedor.map(row => row.tabela);
    const typeColumns = colunsFornecedor.map(row => row.tipo);

    for (let i = 0; i < columns.length; i++) {
        let sqlQuery = ''
        if (typeColumns[i] == 'int') {
            sqlQuery = `
            SELECT  
            b.nome 
            FROM fornecedor AS a 
            JOIN ${titleTable[i]} AS b ON(a.${columns[i]} = b.${columns[i]})  
            WHERE fornecedorID = ?`
        } else {
            sqlQuery = `SELECT  ${columns[i]} FROM fornecedor WHERE fornecedorID = ?`;
        }
        const [queryResult] = await db.promise().query(sqlQuery, [data.fornecedorID]);

        resultData.push({
            name: titleColumns[i],
            value: typeColumns[i] === 'date' && queryResult[0][columns[i]] !== null
                ? new Date(queryResult[0][columns[i]]).toLocaleDateString('pt-BR')
                : typeColumns[i] === 'int'
                    ? queryResult[0]?.nome
                    : queryResult[0][columns[i]]

        });
    }

    // Blocos e itens
    const sqlBlocks = `
    SELECT nome AS nomeBloco
    FROM par_fornecedor_modelo_bloco
    WHERE parFornecedorModeloID = 2 AND status = 1
    ORDER BY ordem ASC`;

    const [resultSqlBlocks] = await db.promise().query(sqlBlocks, [data.fornecedorID]);

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

        const [resultSqlItensBlock] = await db.promise().query(sqlItensBlock, [data.fornecedorID, blockID]);

        blocks.push({
            nomeBloco: block.nomeBloco,
            itens: resultSqlItensBlock,
        });
    }



    return {
        header: resultData,
        blocks
    };

}

module.exports = dynamic;
