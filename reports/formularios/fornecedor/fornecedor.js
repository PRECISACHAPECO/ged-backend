const db = require('../../../config/db');

async function fornecedor(req, res) {
    const data = req.body;
    const { fornecedorID } = data.params;

    //? Obtém unidadeID da fábrica (quem define o padrão do formulário)
    const sqlUnity = `SELECT unidadeID FROM fornecedor WHERE fornecedorID = ?`;
    const [resultUnidade] = await db.promise().query(sqlUnity, [fornecedorID]);
    const { unidadeID } = resultUnidade[0] //? unidadeID da fábrica

    const sqlFornecedor = `
    SELECT * 
    FROM par_fornecedor a 
        JOIN par_fornecedor_unidade b ON (a.parFornecedorID = b.parFornecedorID) 
    WHERE b.unidadeID = ${unidadeID}
    ORDER BY a.ordem ASC`
    const [colunsFornecedor] = await db.promise().query(sqlFornecedor);

    // Varrer result, pegando nomeColuna e inserir em um array 
    const columns = colunsFornecedor.map(row => row.nomeColuna);
    const titleColumns = colunsFornecedor.map(row => row.nomeCampo);

    const resultData = [];
    for (let i = 0; i < columns.length; i++) {
        const sqlQuery = `SELECT ${columns[i]} FROM fornecedor WHERE fornecedorID = ?`;
        const [queryResult] = await db.promise().query(sqlQuery, [fornecedorID]);

        resultData.push({
            title: titleColumns[i],
            value: queryResult[0][columns[i]]
        });
    }

    const [atividades] = await db.promise().query(`SELECT GROUP_CONCAT(a.nome SEPARATOR ', ') as atividade FROM atividade a  LEFT JOIN fornecedor_atividade b on (a.atividadeID = b.atividadeID) WHERE b.fornecedorID = ?`, [fornecedorID]);
    const [sistemaQualidade] = await db.promise().query(`SELECT GROUP_CONCAT(a.nome SEPARATOR ', ') as sistemaQualidade FROM sistemaqualidade a  LEFT JOIN fornecedor_sistemaqualidade b on (a.sistemaQualidadeID = b.sistemaQualidadeID) WHERE b.fornecedorID = ?`, [fornecedorID]);

    const [blocos] = await db.promise().query(`SELECT * FROM par_fornecedor_bloco a WHERE a.unidadeID = ? `, [unidadeID]);
    const resultBlocos = []
    for (let i = 0; i < blocos.length; i++) {
        const [resultTemp] = await db.promise().query(`
        SELECT 
            a.*, b.*,
            case 
                when (SELECT al.nome
                FROM alternativa al 
            WHERE al.alternativaID = a.alternativaID) = 'Data' 
            then (SELECT DATE_FORMAT(fr.resposta, '%d/%m/%Y') 
                FROM fornecedor_resposta fr 
            WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = a.parFornecedorBlocoID AND fr.itemID = a.itemID)
            else  (SELECT fr.resposta 
                FROM fornecedor_resposta fr 
            WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = a.parFornecedorBlocoID AND fr.itemID = a.itemID)
            END as resposta,
            (SELECT fr.obs 
                FROM fornecedor_resposta fr 
            WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = a.parFornecedorBlocoID AND fr.itemID = a.itemID) AS obsResposta
        FROM par_fornecedor_bloco_item a 
            JOIN item b ON (a.itemID = b.itemID)
        WHERE a.parFornecedorBlocoID = ? AND a.status = 1
        ORDER BY a.ordem ASC`, [fornecedorID, fornecedorID, fornecedorID, blocos[i].parFornecedorBlocoID]);

        resultBlocos.push({
            parFornecedorBlocoID: blocos[i].parFornecedorBlocoID,
            nome: blocos[i].nome,
            obs: blocos[i].obs,
            itens: resultTemp
        });
    }

    const result = {
        fields: resultData,
        atividades: atividades[0].atividade,
        sistemaQualidade: sistemaQualidade[0].sistemaQualidade,
        blocos: resultBlocos
    }

    res.status(200).json(result);
};


module.exports = { fornecedor };