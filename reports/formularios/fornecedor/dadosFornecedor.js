
const db = require('../../../config/db');
const { arraysIguais } = require('../../configs/config');


const dadosFornecedor = async (req, res) => {
    const { id } = req.body.data;
    const fornecedorID = id

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
    const [categoria] = await db.promise().query(`SELECT GROUP_CONCAT(a.nome SEPARATOR ', ') as categoria FROM categoria a  LEFT JOIN fornecedor_categoria b on (a.categoriaID = b.categoriaID) WHERE b.fornecedorID = ?`, [fornecedorID]);

    const sqlAllBlocks = `SELECT * FROM par_fornecedor_bloco a WHERE a.unidadeID = ? `
    const [resulAllBlocks] = await db.promise().query(sqlAllBlocks, [unidadeID]);

    const sqlCategorie = `SELECT * FROM fornecedor_categoria WHERE fornecedorID = ?`
    const [resultCategories] = await db.promise().query(sqlCategorie, [fornecedorID]);

    const arrCategories = [];
    for (let i = 0; i < resultCategories.length; i++) {
        arrCategories.push(resultCategories[i].categoriaID);
    }

    let arrayBlocosAtivos = [];

    await Promise.all(resulAllBlocks.map(async (block) => {
        const arrCategoriesBlock = [];
        const sqlBlocksCategories = `SELECT * FROM par_fornecedor_bloco_categoria WHERE parFornecedorBlocoID = ? AND unidadeID = ?`;
        const [resultBlocksCategories] = await db.promise().query(sqlBlocksCategories, [block.parFornecedorBlocoID, unidadeID]);

        // varrer resultBlocksCategories e pegar categoriaID e inserir em arrCategoriesBlock
        for (let i = 0; i < resultBlocksCategories.length; i++) {
            arrCategoriesBlock.push(resultBlocksCategories[i].categoriaID);
        }

        //! Compara se os arrays das categorias e categorias do bloco são iguais
        const resultCompare = arraysIguais(arrCategories, arrCategoriesBlock);
        if (resultCompare) {
            arrayBlocosAtivos.push(block.parFornecedorBlocoID);
        }
    }));

    if (arrayBlocosAtivos.length === 0) {
        res.json({ message: 'Não há blocos ativos para este fornecedor.' })
        return
    }

    const sqlBlocks = `SELECT * FROM par_fornecedor_bloco a WHERE a.unidadeID = ? AND a.parFornecedorBlocoID IN (${arrayBlocosAtivos}) `
    const [blocos] = await db.promise().query(sqlBlocks, [unidadeID]);

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
        categoria: categoria[0].categoria,
        blocos: resultBlocos,
        fornecedorID: fornecedorID
    }

    res.json(result)

}


module.exports = dadosFornecedor;