const db = require('../../config/db');
const { hasPending, deleteItem } = require('../../config/defaultConfig');

class RecebimentoMpController {
    async getData(req, res) {
        const functionName = req.headers['function-name'];
        const unidadeID = req.params.id

        switch (functionName) {
            case 'getList':
                const sqlList = `
                SELECT rm.recebimentompID AS id, DATE_FORMAT(rm.data, "%d/%m/%Y") AS data, t.nome AS transportador, top.nome AS tipoOperacao, rm.status 
                FROM recebimentomp AS rm
                    JOIN transportador AS t ON (rm.transportadorID = t.transportadorID)
                    JOIN tipooperacao AS top ON (rm.tipoOperacaoID = top.tipoOperacaoID)
                WHERE rm.unidadeID = ?`
                db.query(sqlList, [unidadeID], (err, result) => {
                    if (err) { res.status(500).json(err); }

                    res.status(200).json(result);
                })
                break;

            case 'getData':
                const { id } = req.params

                // Fields do header
                const sqlFields = `
                SELECT * 
                FROM par_recebimentomp AS pr 
                    JOIN par_recebimentomp_unidade AS pru ON (pr.parRecebimentompID = pru.parRecebimentompID) 
                WHERE pru.unidadeID = ? 
                ORDER BY pr.ordem ASC`
                const [resultFields] = await db.promise().query(sqlFields, [unidadeID])
                if (resultFields.length === 0) { res.status(500).json('Error'); }

                // Varre fields, verificando se há tipo == 'int', se sim, busca opções pra selecionar no select 
                for (const alternatives of resultFields) {
                    if (alternatives.tipo === 'int' && alternatives.tabela) {
                        // Busca cadastros ativos e da unidade (se houver unidadeID na tabela)
                        let sqlOptions = ``
                        if (alternatives.tabela == 'fornecedor') {
                            sqlOptions = `
                            SELECT fornecedorID AS id, nome AS nome
                            FROM fornecedor 
                            WHERE atual = 1 AND status = 70 AND unidadeID = ${unidadeID} 
                            ORDER BY nome ASC`
                        } else {
                            sqlOptions = `
                            SELECT ${alternatives.tabela}ID AS id, nome
                            FROM ${alternatives.tabela} 
                            WHERE status = 1 ${hasUnidadeID(alternatives.tabela) ? ` AND unidadeID = ${unidadeID} ` : ``}
                            ORDER BY nome ASC`
                        }

                        // Executar select e inserir no objeto alternatives
                        const [resultOptions] = await db.promise().query(sqlOptions)
                        alternatives.options = resultOptions
                    }
                }

                // Varrer result, pegando nomeColuna e inserir em um array se row.tabela == null
                let columns = []
                for (const row of resultFields) {
                    if (!row.tabela) { columns.push(row.nomeColuna) }
                }

                // varrer resultFields 
                let sqlData = ``
                let resultData = {}
                for (const field of resultFields) {
                    if (field.tabela) {
                        // Monta objeto pra preencher select 
                        // Ex.: pessoa:{
                        //     id: 1,
                        //     nome: 'Fulano'
                        // }
                        sqlData = `
                        SELECT t.${field.nomeColuna} AS id, t.nome
                        FROM recebimentomp AS rm 
                            JOIN ${field.tabela} AS t ON (rm.${field.nomeColuna} = t.${field.nomeColuna}) 
                        WHERE rm.recebimentompID = ${id}`
                        let [temp] = await db.promise().query(sqlData)
                        if (temp) {
                            // let objTemp = {}
                            // objTemp[field.tabela] = temp[0]
                            // resultData.push(objTemp)
                            resultData[field.tabela] = temp[0]
                        }
                    }
                }

                sqlData = `SELECT ${columns.join(', ')} FROM recebimentomp WHERE recebimentompID = ${id}`;
                let [temp2] = await db.promise().query(sqlData)
                // resultData.push(temp2[0])
                resultData = { ...resultData, ...temp2[0] }


                // Fields dos Produtos 
                const sqlFieldsProducts = `
                SELECT * 
                FROM par_recebimentomp_produto AS rp 
                    JOIN par_recebimentomp_produto_unidade AS rpu ON (rp.parRecebimentoMpProdutoID = rpu.parRecebimentoMpProdutoID) 
                WHERE rpu.unidadeID = ? 
                ORDER BY rp.ordem ASC`
                const [resultFieldsProducts] = await db.promise().query(sqlFieldsProducts, [unidadeID])
                if (resultFieldsProducts.length === 0) { res.status(500).json('Error'); }

                // Blocos 
                const sqlBlocos = `
                SELECT * 
                FROM par_recebimentomp_bloco
                WHERE unidadeID = ? AND status = 1
                ORDER BY ordem ASC`
                const [resultBlocos] = await db.promise().query(sqlBlocos, [unidadeID])

                // Itens
                const sqlItem = `
                SELECT prbi.*, i.*, a.nome AS alternativa,

                    (SELECT rr.respostaID
                    FROM recebimentomp_resposta AS rr 
                    WHERE rr.recebimentompID = ? AND rr.parRecebimentompBlocoID = prbi.parRecebimentompBlocoID AND rr.itemID = prbi.itemID) AS respostaID,
                    
                    (SELECT rr.resposta
                    FROM recebimentomp_resposta AS rr 
                    WHERE rr.recebimentompID = ? AND rr.parRecebimentompBlocoID = prbi.parRecebimentompBlocoID AND rr.itemID = prbi.itemID) AS resposta,

                    (SELECT rr.obs
                    FROM recebimentomp_resposta AS rr 
                    WHERE rr.recebimentompID = ? AND rr.parRecebimentompBlocoID = prbi.parRecebimentompBlocoID AND rr.itemID = prbi.itemID) AS observacao

                FROM par_recebimentomp_bloco_item AS prbi 
                    LEFT JOIN item AS i ON (prbi.itemID = i.itemID)
                    LEFT JOIN alternativa AS a ON (prbi.alternativaID = a.alternativaID)
                WHERE prbi.parRecebimentompBlocoID = ?
                ORDER BY prbi.ordem ASC`
                for (const item of resultBlocos) {
                    const [resultItem] = await db.promise().query(sqlItem, [id, id, id, item.parRecebimentompBlocoID])

                    // Obter alternativas para cada item 
                    const sqlAlternativa = `
                    SELECT *
                    FROM par_recebimentomp_bloco_item AS prbi 
                        JOIN alternativa AS a ON (prbi.alternativaID = a.alternativaID)
                        JOIN alternativa_item AS ai ON (a.alternativaID = ai.alternativaID)
                    WHERE prbi.itemID = ?`
                    for (const item2 of resultItem) {
                        const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item2.itemID])
                        item2.alternativas = resultAlternativa
                    }

                    item.itens = resultItem
                }

                // Observação e status
                const sqlOtherInformations = `
                SELECT obs, status
                FROM recebimentomp
                WHERE recebimentompID = ?`
                const [resultOtherInformations] = await db.promise().query(sqlOtherInformations, [id])

                const data = {
                    fields: resultFields,
                    data: resultData,
                    resultFieldsProducts: resultFieldsProducts,
                    blocos: resultBlocos,
                    info: {
                        obs: resultOtherInformations[0].obs,
                        status: resultOtherInformations[0].status,
                    }
                }

                res.status(200).json(data);
                break;
        }
    }

    insertData(req, res) {
        const { nome } = req.body;
        db.query("SELECT * FROM item", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const rows = result.find(row => row.nome === nome);
                if (rows) {
                    res.status(409).json(err);
                } else {
                    db.query("INSERT INTO item (nome) VALUES (?)", [nome], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json(err);
                        } else {
                            res.status(201).json(result);
                        }
                    });
                }
            }
        });
    }

    async updateData(req, res) {
        const { id } = req.params
        const data = req.body

        // Header         
        if (data.header) {
            let dataHeader = getDataOfAllTypes(data.header) // Função que valida tipos dos campos, se for objeto, obtem objeto.id pra somente gravar no BD
            const sqlHeader = `UPDATE recebimentomp SET ? WHERE recebimentompID = ${id}`;
            const [resultHeader] = await db.promise().query(sqlHeader, [dataHeader])
            console.log("🚀 ~ file: recebimentoMpController.js:211 ~ RecebimentoMpController ~ updateData ~ dataHeader:", dataHeader)
            if (resultHeader.length === 0) { res.status(500).json('Error'); }
        }

        // Blocos 
        for (const bloco of data.blocos) {
            // Itens 
            for (const item of bloco.itens) {
                if (item.resposta || item.observacao) {

                    console.log('==> ', item)

                    // Verifica se já existe registro em fornecedor_resposta, com o fornecedorID, parFornecedorBlocoID e itemID, se houver, faz update, senao faz insert 
                    const sqlVerificaResposta = `SELECT * FROM recebimentomp_resposta WHERE recebimentompID = ? AND parRecebimentompBlocoID = ? AND itemID = ?`
                    const [resultVerificaResposta] = await db.promise().query(sqlVerificaResposta, [id, bloco.parRecebimentompBlocoID, item.itemID])

                    if (resultVerificaResposta.length === 0) {
                        console.log('Insere resposta')
                        // insert na tabela fornecedor_resposta
                        const sqlInsert = `INSERT INTO recebimentomp_resposta (recebimentompID, parRecebimentompBlocoID, itemID, resposta, respostaID, obs) VALUES (?, ?, ?, ?, ?, ?)`
                        const [resultInsert] = await db.promise().query(sqlInsert, [id, bloco.parRecebimentompBlocoID, item.itemID, (item.resposta ?? ''), (item.respostaID ?? 0), (item.observacao ?? '')])
                        if (resultInsert.length === 0) { res.status(500).json('Error'); }
                    } else {
                        console.log('Altera resposta')
                        // update na tabela fornecedor_resposta
                        const sqlUpdate = `
                        UPDATE 
                            recebimentomp_resposta 
                        SET ${item.resposta ? 'resposta = ?, ' : ''} 
                            ${item.respostaID ? 'respostaID = ?, ' : ''} 
                            ${item.observacao != undefined ? 'obs = ?, ' : ''} 
                            recebimentompID = ?
                        WHERE recebimentompID = ? 
                            AND parRecebimentompBlocoID = ? 
                            AND itemID = ?`
                        const [resultUpdate] = await db.promise().query(sqlUpdate, [
                            ...(item.resposta ? [item.resposta] : []),
                            ...(item.respostaID ? [item.respostaID] : []),
                            ...(item.observacao != undefined ? [item.observacao] : []),
                            id,
                            id,
                            bloco.parRecebimentompBlocoID,
                            item.itemID
                        ])
                        if (resultUpdate.length === 0) { res.status(500).json('Error'); }
                    }
                }
            }

            // Observação e Status (se houver)
            const sqlUpdateObs = `UPDATE recebimentomp SET obs = ? ${data.status > 0 ? ', status = ? ' : ''} WHERE recebimentompID = ?`
            const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [
                data.obs,
                ...(data.status > 0 ? [data.status] : []),
                id
            ])
            if (resultUpdateObs.length === 0) { res.status(500).json('Error'); }

        }

        console.log('Até aqui ok!')
        res.status(200).json({})
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: 'item',
            column: 'itemID'
        }
        const tablesPending = [] // Tabelas que possuem relacionamento com a tabela atual

        if (!tablesPending || tablesPending.length === 0) {
            return deleteItem(id, objModule.table, objModule.column, res)
        }

        hasPending(id, objModule.column, tablesPending)
            .then((hasPending) => {
                if (hasPending) {
                    res.status(409).json({ message: "Dado possui pendência." });
                } else {
                    return deleteItem(id, objModule.table, objModule.column, res)
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    }

}

// varrer data.header verificando se é um objeto ou nao, se for objeto inserir o id em dataHeader, senao, inserir o valor em dataHeader
function getDataOfAllTypes(dataFromFrontend) {
    let dataHeader = {}
    for (const key in dataFromFrontend) {
        if (typeof dataFromFrontend[key] === 'object') {
            dataHeader[`${key}ID`] = dataFromFrontend[key].id
        } else {
            dataHeader[key] = dataFromFrontend[key]
        }
    }

    return dataHeader;
}

function hasUnidadeID(tabela) {
    return false
}

module.exports = RecebimentoMpController;