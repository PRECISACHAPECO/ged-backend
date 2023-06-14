const db = require('../../../config/db');
require('dotenv/config')
const { hasPending, deleteItem } = require('../../../config/defaultConfig');
const { addFormStatusMovimentation } = require('../../../defaults/functions');

class RecebimentoMpController {
    async getList(req, res) {
        const { unidadeID } = req.params;

        const sql = `
        SELECT rm.recebimentompID AS id, IF(MONTH(rm.data) > 0, DATE_FORMAT(rm.data, "%d/%m/%Y"), '') AS data, t.nome AS transportador, top.nome AS tipoOperacao, rm.status 
        FROM recebimentomp AS rm
            LEFT JOIN transportador AS t ON (rm.transportadorID = t.transportadorID)
            LEFT JOIN tipooperacao AS top ON (rm.tipoOperacaoID = top.tipoOperacaoID)
        WHERE rm.unidadeID = ?`
        const [result] = await db.promise().query(sql, [unidadeID])

        res.status(200).json(result)
    }

    async getNewData(req, res) {

    }

    async getData(req, res) {
        const { id } = req.params;
        const { type, unidadeID } = req.body;

        if (!id || id == 'undefined') { return res.json({ message: 'Erro ao listar recebimento' }) }

        //? Fields do header
        const resultFields = await getFields(unidadeID)

        // Varrer result, pegando nomeColuna e inserir em um array se row.tabela == null
        let columns = []
        for (const row of resultFields) {
            if (!row.tabela) { columns.push(row.nomeColuna) }
        }

        // varrer resultFields 
        let sqlData = ``
        let resultData = {}
        if (type == 'edit') {
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
                        resultData[field.tabela] = temp[0]
                    }
                }
            }

            sqlData = `SELECT ${columns.join(', ')} FROM recebimentomp WHERE recebimentompID = ${id}`;
            let [temp2] = await db.promise().query(sqlData)
            resultData = { ...resultData, ...temp2[0] }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////

        //? Fields dos Produtos (colunas)
        const resultFieldsProducts = await getFieldsProduct(unidadeID)

        // Dados (linhas)
        let dataProducts = []
        if (type == 'edit') {
            const sqlDataProducts = `SELECT * FROM recebimentomp_produto WHERE recebimentompID = ?`
            let [resultDataProducts] = await db.promise().query(sqlDataProducts, [id])

            // Dados dos produtos (array com os produtos)
            let sqlProductsData = ``
            let dataFieldProducts = {}
            for (const data of resultDataProducts) {
                for (const field of resultFieldsProducts) {
                    if (field.tipo === 'int' && field.tabela) {
                        // Monta objeto pra preencher select 
                        // Ex.: pessoa:{
                        //     id: 1,
                        //     nome: 'Fulano'
                        // }
                        sqlProductsData = `
                        SELECT t.${field.nomeColuna} AS id, t.nome
                        FROM recebimentomp_produto AS rm 
                            JOIN ${field.tabela} AS t ON (rm.${field.nomeColuna} = t.${field.nomeColuna}) 
                        WHERE rm.recebimentompID = ${id} AND t.${field.nomeColuna} = ${data[field.nomeColuna]}`

                        let [temp] = await db.promise().query(sqlProductsData)
                        if (temp) {
                            dataFieldProducts[field.tabela] = temp[0]
                        }
                    } else {
                        dataFieldProducts[field.nomeColuna] = data[field.nomeColuna]
                    }
                }

                dataProducts.push({ ...data, ...dataFieldProducts })
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////

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
            WHERE rr.recebimentompID = ? AND rr.parRecebimentompBlocoID = prbi.parRecebimentompBlocoID AND rr.itemID = prbi.itemID
            LIMIT 1) AS respostaID,
            
            (SELECT rr.resposta
            FROM recebimentomp_resposta AS rr 
            WHERE rr.recebimentompID = ? AND rr.parRecebimentompBlocoID = prbi.parRecebimentompBlocoID AND rr.itemID = prbi.itemID
            LIMIT 1) AS resposta,

            (SELECT rr.obs
            FROM recebimentomp_resposta AS rr 
            WHERE rr.recebimentompID = ? AND rr.parRecebimentompBlocoID = prbi.parRecebimentompBlocoID AND rr.itemID = prbi.itemID
            LIMIT 1) AS observacao

        FROM par_recebimentomp_bloco_item AS prbi 
            LEFT JOIN item AS i ON (prbi.itemID = i.itemID)
            LEFT JOIN alternativa AS a ON (prbi.alternativaID = a.alternativaID)
        WHERE prbi.parRecebimentompBlocoID = ?
        ORDER BY prbi.ordem ASC`
        for (const item of resultBlocos) {
            const [resultItem] = await db.promise().query(sqlItem, [id, id, id, item.parRecebimentompBlocoID])

            // Obter alternativas para cada item 
            for (const item2 of resultItem) {

                // Cria objeto da resposta (se for de selecionar)
                if (item2?.respostaID > 0) {
                    item2.resposta = {
                        id: item2.respostaID,
                        nome: item2.resposta
                    }
                }

                const sqlAlternativa = `
                SELECT *
                FROM par_recebimentomp_bloco_item AS prbi 
                    JOIN alternativa AS a ON (prbi.alternativaID = a.alternativaID)
                    JOIN alternativa_item AS ai ON (a.alternativaID = ai.alternativaID)
                WHERE prbi.parRecebimentompBlocoItemID = ?`
                const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item2.parRecebimentompBlocoItemID])
                item2.alternativas = resultAlternativa
            }

            item.itens = resultItem
        }

        // Observação e status
        let resultOtherInformations = null
        if (type == 'edit') {
            const sqlOtherInformations = `
            SELECT obs, status
            FROM recebimentomp
            WHERE recebimentompID = ?`
            const [temp] = await db.promise().query(sqlOtherInformations, [id])
            resultOtherInformations = temp[0]
        }

        const data = {
            fields: resultFields,
            data: resultData,
            fieldsProducts: resultFieldsProducts,
            dataProducts: dataProducts.length > 0 ? dataProducts : [{}], //? Inicia com 1 produto aberto
            blocos: resultBlocos,
            info: {
                obs: resultOtherInformations?.obs,
                status: resultOtherInformations?.status,
            }
        }

        res.status(200).json(data);
    }

    async insertData(req, res) {
        const { data, unidadeID } = req.body

        // Header         
        if (data.header) {
            //* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
            let dataHeader = await formatFieldsToTable('par_recebimentomp', data.header)
            dataHeader.unidadeID = unidadeID

            const sqlInsertHeader = `INSERT INTO recebimentomp SET ?`
            const [resultInsertHeader] = await db.promise().query(sqlInsertHeader, [dataHeader])
            if (resultInsertHeader.length === 0) { return res.status(500).json('Error'); }
            const id = resultInsertHeader.insertId

            if (!id) { return res.json('Error'); }

            // Produtos 
            if (data.produtos) {
                for (const produto of data.produtos) {
                    //* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
                    let dataProduto = await formatFieldsToTable('par_recebimentomp_produto', produto)

                    dataProduto['recebimentompID'] = id
                    const sqlInsertProduto = `INSERT INTO recebimentomp_produto SET ?`
                    const [resultInsertProduto] = await db.promise().query(sqlInsertProduto, [dataProduto])
                    if (resultInsertProduto.length === 0) { return res.status(500).json('Error'); }
                }
            }

            // Blocos 
            for (const bloco of data.blocos) {
                // Itens 
                for (const item of bloco.itens) {
                    if (item.resposta || item.observacao) {
                        // valida duplicidade
                        const sqlVerify = `SELECT recebimentompID FROM recebimentomp_resposta WHERE recebimentompID = ? AND parRecebimentompBlocoID = ? AND itemID = ?`
                        const [resultVerify] = await db.promise().query(sqlVerify, [id, bloco.parRecebimentompBlocoID, item.itemID])
                        if (resultVerify.length === 0) {
                            // insert na tabela fornecedor_resposta
                            const sqlInsert = `INSERT INTO recebimentomp_resposta (recebimentompID, parRecebimentompBlocoID, itemID, resposta, respostaID, obs) VALUES (?, ?, ?, ?, ?, ?)`
                            const [resultInsert] = await db.promise().query(sqlInsert, [
                                id,
                                bloco.parRecebimentompBlocoID,
                                item.itemID,
                                (item.resposta?.nome ? item.resposta.nome : item.resposta ? item.resposta : ''),
                                (item.resposta?.id > 0 ? item.resposta.id : 0),
                                (item.observacao ?? '')
                            ])
                            if (resultInsert.length === 0) { return res.status(500).json('Error'); }
                        }
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
            if (resultUpdateObs.length === 0) { return res.status(500).json('Error'); }

            res.status(200).json(id)
        }
    }

    async updateData(req, res) {
        const { id } = req.params
        const data = req.body.forms
        const { usuarioID, papelID, unidadeID } = req.body.auth
        console.log("🚀 ~ usuarioID, papelID, unidadeID:", usuarioID, papelID, unidadeID)

        if (!id || id == 'undefined') { return res.json({ message: 'ID não recebido!' }); }

        const sqlStatus = `SELECT status FROM recebimentomp WHERE recebimentompID = ?`
        const [resultStatus] = await db.promise().query(sqlStatus, [id])

        // Header         
        if (data.header) {
            //* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
            let dataHeader = await formatFieldsToTable('par_recebimentomp', data.header)
            const sqlHeader = `UPDATE recebimentomp SET ? WHERE recebimentompID = ${id}`;
            const [resultHeader] = await db.promise().query(sqlHeader, [dataHeader])
            if (resultHeader.length === 0) { return res.status(500).json('Error'); }
        }

        // Produtos 
        if (data.produtos) {
            for (const produto of data.produtos) {
                //* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
                let dataProduto = await formatFieldsToTable('par_recebimentomp_produto', produto)

                if (produto.recebimentompProdutoID > 0) { // UPDATE
                    const sqlUpdateProduto = `UPDATE recebimentomp_produto SET ? WHERE recebimentompProdutoID = ?`
                    const [resultUpdateProduto] = await db.promise().query(sqlUpdateProduto, [dataProduto, produto.recebimentompProdutoID])
                    if (resultUpdateProduto.length === 0) { return res.status(500).json('Error'); }
                } else {                                  // INSERT
                    dataProduto['recebimentompID'] = id
                    const sqlInsertProduto = `INSERT INTO recebimentomp_produto SET ?`
                    const [resultInsertProduto] = await db.promise().query(sqlInsertProduto, [dataProduto])
                    if (resultInsertProduto.length === 0) { return res.status(500).json('Error'); }
                }
            }
            // Remove os produtos removidos
            if (data.removedProducts.length > 0) {
                const removedProductIds = data.removedProducts.map(product => product.recebimentompProdutoID);
                const sqlRemoveProduct = `DELETE FROM recebimentomp_produto WHERE recebimentompProdutoID IN (${removedProductIds.join(',')})`;
                const [resultRemoveProduct] = await db.promise().query(sqlRemoveProduct)
                if (resultRemoveProduct.length === 0) {
                    return res.json('Error');
                }
            }
        }

        // Blocos 
        for (const bloco of data.blocos) {
            if (bloco && bloco.parRecebimentompBlocoID && bloco.parRecebimentompBlocoID > 0) {
                // Itens 
                for (const item of bloco.itens) {
                    if (item && item.itemID && item.itemID > 0) {
                        if (item.resposta || item.observacao) {
                            // Verifica se já existe registro em fornecedor_resposta, com o fornecedorID, parFornecedorBlocoID e itemID, se houver, faz update, senao faz insert 
                            const sqlVerificaResposta = `SELECT * FROM recebimentomp_resposta WHERE recebimentompID = ? AND parRecebimentompBlocoID = ? AND itemID = ?`
                            const [resultVerificaResposta] = await db.promise().query(sqlVerificaResposta, [id, bloco.parRecebimentompBlocoID, item.itemID])

                            const resposta = item.resposta?.id > 0 ? item.resposta.nome : item.resposta ? item.resposta : ''
                            const respostaID = item.resposta?.id > 0 ? item.resposta.id : null
                            const observacao = item.observacao != undefined ? item.observacao : ''

                            if (resultVerificaResposta.length === 0) {
                                // insert na tabela fornecedor_resposta
                                const sqlInsert = `INSERT INTO recebimentomp_resposta (recebimentompID, parRecebimentompBlocoID, itemID, resposta, respostaID, obs) VALUES (?, ?, ?, ?, ?, ?)`
                                const [resultInsert] = await db.promise().query(sqlInsert, [
                                    id,
                                    bloco.parRecebimentompBlocoID,
                                    item.itemID,
                                    resposta,
                                    respostaID,
                                    observacao,
                                ])
                                if (resultInsert.length === 0) { return res.status(500).json('Error'); }
                            } else {
                                // update na tabela fornecedor_resposta
                                const sqlUpdate = `
                                UPDATE 
                                    recebimentomp_resposta 
                                SET resposta = ?,
                                    respostaID = ?,
                                    obs = ?,
                                    recebimentompID = ?
                                WHERE recebimentompID = ? 
                                    AND parRecebimentompBlocoID = ? 
                                    AND itemID = ?`
                                const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                    resposta,
                                    respostaID,
                                    observacao,
                                    id,
                                    id,
                                    bloco.parRecebimentompBlocoID,
                                    item.itemID
                                ])
                                if (resultUpdate.length === 0) { return res.json('Error'); }
                            }
                        }
                    }
                }
            }
        }

        // Observação e Status (se houver)
        const sqlUpdateObs = `UPDATE recebimentomp SET obs = ?, obsConclusao = ? ${data.status > 0 ? ', status = ? ' : ''} WHERE recebimentompID = ?`
        const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [
            data.obs,
            data?.obsConclusao ? data?.obsConclusao : null,
            ...(data.status > 0 ? [data.status] : []),
            id
        ])
        if (resultUpdateObs.length === 0) { return res.json('Error'); }

        //? Gera histórico de alteração de status (se alterou de status)
        if (resultStatus[0]['status'] != data.status) {
            const movimentation = await addFormStatusMovimentation(2, id, usuarioID, unidadeID, papelID, resultStatus[0]['status'] ?? '0', data.status)
            if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
        }

        res.status(200).json({})
    }

    async verifyFormPending(req, res) {
        const { id } = req.params;
        const { parFormularioID } = req.body;

        //? Recebimento MP
        if (parFormularioID == 2) {
            //todo Inserir tabela verificando se há ocorrencia de recebimentompID
            // const sql = `SELECT * FROM recebimentomp WHERE fornecedorID = ?`
            // const [result] = await db.promise().query(sql, [id])
            // const pending = result.length === 0 ? false : true

            const pending = false
            return res.status(200).json(pending)
        }

        res.status(200).json(true)
    }

    //? Atualiza status
    async changeFormStatus(req, res) {
        const { id } = req.params
        const status = req.body.status
        const { usuarioID, papelID, unidadeID } = req.body.auth

        const sqlData = `SELECT status FROM recebimentomp WHERE recebimentompID = ?`
        const [resultData] = await db.promise().query(sqlData, [id])

        //? Atualiza status do formulário
        if (status) {
            const sqlUpdateStatus = `UPDATE recebimentomp SET status = ? WHERE recebimentompID = ?`
            const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [status, id])

            //? Gera histórico de alteração de status
            const movimentation = await addFormStatusMovimentation(2, id, usuarioID, unidadeID, papelID, resultData[0]['status'] ?? '0', status)
            if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
        }

        res.status(200).json({ message: 'Ok' })
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

//* Obtém colunas
const getFields = async (unidadeID) => {
    const sqlFields = `
            SELECT * 
            FROM par_recebimentomp AS pr 
                JOIN par_recebimentomp_unidade AS pru ON (pr.parRecebimentompID = pru.parRecebimentompID) 
            WHERE pru.unidadeID = ? 
            ORDER BY pr.ordem ASC`
    const [resultFields] = await db.promise().query(sqlFields, [unidadeID])
    if (resultFields.length === 0) { return res.json({ message: 'Nenhum campo encontrado' }) }

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
                WHERE status = 1 ${await hasUnidadeID(alternatives.tabela) ? ` AND unidadeID = ${unidadeID} ` : ``}
                ORDER BY nome ASC`
            }

            // Executar select e inserir no objeto alternatives
            const [resultOptions] = await db.promise().query(sqlOptions)
            alternatives.options = resultOptions
        }
    }

    return resultFields
}

const getFieldsProduct = async (unidadeID) => {
    const sqlFieldsProducts = `
    SELECT * 
    FROM par_recebimentomp_produto AS rp 
        JOIN par_recebimentomp_produto_unidade AS rpu ON (rp.parRecebimentoMpProdutoID = rpu.parRecebimentoMpProdutoID) 
    WHERE rpu.unidadeID = ? 
    ORDER BY rp.ordem ASC`
    const [resultFieldsProducts] = await db.promise().query(sqlFieldsProducts, [unidadeID])
    if (resultFieldsProducts.length === 0) { return res.json({ message: 'Erro ao obter produtos!' }); }
    // Se houver join com outra tabela, monta as opções pra selecionar no select (autocomplete)
    for (const alternatives of resultFieldsProducts) {
        if (alternatives.tipo === 'int' && alternatives.tabela) {
            // Busca cadastros ativos e da unidade (se houver unidadeID na tabela)
            let sqlProductsOptions = `
                SELECT ${alternatives.tabela}ID AS id, nome
                FROM ${alternatives.tabela} 
                WHERE status = 1 ${await hasUnidadeID(alternatives.tabela) ? ` AND unidadeID = ${unidadeID} ` : ``}
                ORDER BY nome ASC`

            // Executar select e inserir no objeto alternatives
            const [resultProductsOptions] = await db.promise().query(sqlProductsOptions)
            alternatives.options = resultProductsOptions
        }
    }

    return resultFieldsProducts
}

//* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
const formatFieldsToTable = async (table, fields) => {
    let dataHeader = {}
    for (const columnName in fields) {
        const sql = `SELECT * FROM ${table} WHERE tabela = "${columnName}" `
        const [result] = await db.promise().query(sql)
        if (result.length > 0) {
            dataHeader[`${columnName}ID`] = fields[columnName]?.id > 0 ? fields[columnName].id : 0
        } else {
            dataHeader[columnName] = fields[columnName] ? fields[columnName] : null
        }
    }
    return dataHeader;
}

const hasUnidadeID = async (table) => {
    const sql = `
    SELECT *
    FROM information_schema.columns
    WHERE table_schema = "${process.env.DB_DATABASE}" AND table_name = "${table}" AND column_name = "unidadeID" `
    const [result] = await db.promise().query(sql)

    return result.length === 0 ? false : true;
}

module.exports = RecebimentoMpController;