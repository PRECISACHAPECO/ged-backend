
const db = require('../../../config/db');
const { arraysIguais } = require('../../configs/config');

const dadosRecebimentoMp = async (req, res) => {
    const { id, unidadeID } = req.body.data;
    const recebimentoMpID = id

    if (!id) {
        return res.json({ error: 'ID não informado!' })
    }

    const sqlRecebimentoMp = `
    SELECT * 
    FROM par_recebimentomp a 
        JOIN par_recebimentomp_unidade b ON (a.parRecebimentompID = b.parRecebimentompID) 
    WHERE b.unidadeID = ${unidadeID}
    ORDER BY a.ordem ASC`
    const [colunsFornecedor] = await db.promise().query(sqlRecebimentoMp);

    // Varrer result, pegando nomeColuna e inserir em um array 
    const columns = colunsFornecedor.map(row => row.nomeColuna);
    const titleColumns = colunsFornecedor.map(row => row.nomeCampo);
    const titleTable = colunsFornecedor.map(row => row.tabela);
    const typeColumns = colunsFornecedor.map(row => row.tipo);

    const resultData = [];
    for (let i = 0; i < columns.length; i++) {
        // Tem ligação com outra tabela
        let sqlQuery = ''
        if (typeColumns[i] == 'int') {
            sqlQuery = `
            SELECT  
            b.nome 
            FROM recebimentomp AS a 
            JOIN ${titleTable[i]} AS b ON(a.${columns[i]} = b.${columns[i]})  
            WHERE recebimentompID = ?`
        } else {
            sqlQuery = `SELECT  ${columns[i]} FROM recebimentomp WHERE recebimentompID = ?`;
        }
        const [queryResult] = await db.promise().query(sqlQuery, [recebimentoMpID]);

        resultData.push({
            title: titleColumns[i],
            value: typeColumns[i] === 'date' && queryResult[0][columns[i]] !== null
                ? new Date(queryResult[0][columns[i]]).toLocaleDateString('pt-BR')
                : typeColumns[i] === 'int'
                    ? queryResult[0]?.nome
                    : queryResult[0][columns[i]]
        });
    }

    //? Produtos
    const sqlProdutos = `
    SELECT 
        b.nome AS produto,
        c.nome as apresentacao,
        d.nome as atividade
    FROM recebimentomp_produto AS a 
        JOIN produto AS b on (a.produtoID = b.produtoID)
        JOIN apresentacao AS c on (a.apresentacaoID = c.apresentacaoID)
        JOIN atividade AS d on (a.atividadeID = d.atividadeID)
    WHERE a.recebimentompID = ?`
    const [sqlResulProdutos] = await db.promise().query(sqlProdutos, [recebimentoMpID]);

    //? Blocos
    const sqlAllBlocks = `SELECT * FROM par_recebimentomp_bloco a WHERE a.unidadeID = ? `
    const [resulAllBlocks] = await db.promise().query(sqlAllBlocks, [unidadeID]);
    console.log("🚀 ~ resulAllBlocks:", resulAllBlocks)

    const resultBlocos = []
    for (let i = 0; i < resulAllBlocks.length; i++) {
        const [resultTemp] = await db.promise().query(`
        SELECT 
            a.*, b.*,
            case 
                when (SELECT al.nome
                FROM alternativa al 
            WHERE al.alternativaID = a.alternativaID) = 'Data' 
            then (SELECT DATE_FORMAT(fr.resposta, '%d/%m/%Y') 
                FROM recebimentomp_resposta fr 
            WHERE fr.recebimentompID = ? AND fr.parRecebimentompBlocoID = a.parRecebimentompBlocoID AND fr.itemID = a.itemID)
            else  (SELECT fr.resposta 
                FROM recebimentomp_resposta fr 
            WHERE fr.recebimentompID = ? AND fr.parRecebimentompBlocoID = a.parRecebimentompBlocoID AND fr.itemID = a.itemID)
            END as resposta,
            (SELECT fr.obs 
                FROM recebimentomp_resposta fr 
            WHERE fr.recebimentompID = ? AND fr.parRecebimentompBlocoID = a.parRecebimentompBlocoID AND fr.itemID = a.itemID) AS obsResposta
        FROM par_recebimentomp_bloco_item a 
            JOIN item b ON (a.itemID = b.itemID)
        WHERE a.parRecebimentompBlocoID = ? AND a.status = 1
        ORDER BY a.ordem ASC`, [recebimentoMpID, recebimentoMpID, recebimentoMpID, resulAllBlocks[i].parRecebimentompBlocoID]);

        resultBlocos.push({
            parRecebimentompBlocoID: resulAllBlocks[i].parRecebimentompBlocoID,
            nome: resulAllBlocks[i].nome,
            obs: resulAllBlocks[i].obs,
            itens: resultTemp
        });
    }

    const result = {
        fields: resultData,
        produtos: sqlResulProdutos,
        blocos: resultBlocos,
        recebimentoMpID: recebimentoMpID,
    }

    res.json(result)

}


module.exports = dadosRecebimentoMp;