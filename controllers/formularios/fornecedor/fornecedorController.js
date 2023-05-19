const db = require('../../../config/db');
const { hasPending, deleteItem, criptoMd5, onlyNumbers } = require('../../../config/defaultConfig');
const instructionsNewFornecedor = require('../../../email/template/formularios/fornecedor/instructionsNewFornecedor');
const sendMailConfig = require('../../../config/email');



class FornecedorController {
    async getList(req, res) {
        const { unidadeID, papelID, cnpj } = req.body;

        //* Fábrica 
        if (papelID == 1) {
            const sql = `SELECT fornecedorID AS id, cnpj, nome, cidade, estado, telefone, status FROM fornecedor WHERE unidadeID = ${unidadeID}`
            const [result] = await db.promise().query(sql)
            res.status(200).json(result);
        }
        //* Fornecedor 
        else if (papelID == 2 && cnpj) {
            const sql = `SELECT fornecedorID AS id, cnpj, nome, cidade, estado, telefone, status FROM fornecedor WHERE cnpj = "${cnpj}"`
            const [result] = await db.promise().query(sql)
            res.status(200).json(result);
        }
    }

    //* Retorna a estrutura do formulário (sem os dados)
    async getFormStructure(req, res) {
        const { unidadeID } = req.body; // unidade da fábrica (configurações do formulário)
        console.log("🚀 ~ getFormStructure ~ unidadeID:", unidadeID)

        // Fields do header
        const [resultFields] = await getResultFields(unidadeID)
        if (resultFields.length === 0) { return res.status(500).json('Error'); }

        // Atividades 
        const [resultAtividade] = await getResultAtividades(0)
        if (resultAtividade.length === 0) { return res.status(500).json('Error'); }

        // Sistemas de qualidade 
        const [resultSistemaQualidade] = await getResultSistemasQualidade(0)
        if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }

        // Blocos 
        const [resultBlocos] = await getBlocos(unidadeID)

        // Itens
        const sqlItem = getSqlItem()
        for (const item of resultBlocos) {
            const [resultItem] = await db.promise().query(sqlItem, [0, 0, 0, item.parFornecedorBlocoID])

            // Obter alternativas para cada item 
            const sqlAlternativa = getAlternativasSql()
            for (const item2 of resultItem) {
                const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item2.itemID])
                item2.alternativas = resultAlternativa
            }

            item.itens = resultItem
        }

        const data = {
            fields: resultFields,
            data: null,
            atividades: resultAtividade,
            sistemasQualidade: resultSistemaQualidade,
            blocos: resultBlocos,
            info: {
                obs: null,
                status: null,
            }
        }

        res.status(200).json(data);
    }

    //* Retorna a estrutura do formulário configurada pra aquela unidade
    async getData(req, res) {
        const { id } = req.params; // id do formulário

        //? obtém a unidadeID (fábrica) do formulário, pro formulário ter os campos de preenchimento de acordo com o configurado pra aquela fábrica.
        const sqlUnidade = `SELECT unidadeID FROM fornecedor WHERE fornecedorID = ${id}`
        const [resultUnidade] = await db.promise().query(sqlUnidade)
        const unidadeID = resultUnidade[0].unidadeID

        // Fields do header
        const [resultFields] = await getResultFields(unidadeID)
        if (resultFields.length === 0) { return res.status(500).json('Error'); }

        // Varrer result, pegando nomeColuna e inserir em um array 
        const columns = resultFields.map(row => row.nomeColuna);

        // Montar select na tabela fornecedor, onde as colunas do select serão as colunas do array columns
        const sqlData = `SELECT ${columns.join(', ')} FROM fornecedor WHERE fornecedorID = ?`;
        const [resultData] = await db.promise().query(sqlData, [id])
        if (resultData.length === 0) { return res.status(500).json('Error'); }

        // Atividades 
        const [resultAtividade] = await getResultAtividades(id)
        if (resultAtividade.length === 0) { return res.status(500).json('Error'); }

        // Sistemas de qualidade 
        const [resultSistemaQualidade] = await getResultSistemasQualidade(id)
        if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }

        // Blocos 
        const [resultBlocos] = await getBlocos(unidadeID)

        // Itens
        const sqlItem = getSqlItem()
        for (const item of resultBlocos) {
            const [resultItem] = await db.promise().query(sqlItem, [id, id, id, item.parFornecedorBlocoID])

            // Obter alternativas para cada item 
            const sqlAlternativa = getAlternativasSql()
            for (const item2 of resultItem) {
                const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item2.itemID])
                item2.alternativas = resultAlternativa
            }

            item.itens = resultItem
        }

        // Observação e status
        const sqlOtherInformations = getSqlOtherInfos()
        const [resultOtherInformations] = await db.promise().query(sqlOtherInformations, [id])

        const data = {
            fields: resultFields,
            data: resultData[0],
            atividades: resultAtividade,
            sistemasQualidade: resultSistemaQualidade,
            blocos: resultBlocos,
            info: {
                obs: resultOtherInformations[0].obs,
                status: resultOtherInformations[0].status,
            }
        }

        res.status(200).json(data);
    }

    async insertData(req, res) {
        const data = req.body

        // Header 
        const sqlHeader = `INSERT INTO fornecedor SET ? VALUES ?`;
        const [resultHeader] = await db.promise().query(sqlHeader, [data.header])
        if (resultHeader.length === 0) { return res.status(500).json('Error'); }
        const id = resultHeader.insertId

        // Atividades
        for (const atividade of data.atividades) {
            if (atividade.checked) {
                // Verifica se já existe registro desse dado na tabela fornecedor_atividade
                const sqlAtividade = `SELECT * FROM fornecedor_atividade WHERE fornecedorID = ? AND atividadeID = ?`
                const [resultSelectAtividade] = await db.promise().query(sqlAtividade, [id, atividade.atividadeID])
                // Se ainda não houver registro, fazer insert na tabela 
                if (resultSelectAtividade.length === 0) {
                    const sqlAtividade2 = `INSERT INTO fornecedor_atividade (fornecedorID, atividadeID) VALUES (?, ?)`
                    const [resultAtividade] = await db.promise().query(sqlAtividade2, [id, atividade.atividadeID])
                    if (resultAtividade.length === 0) { return res.status(500).json('Error'); }
                }
            } else {
                const sqlAtividade = `DELETE FROM fornecedor_atividade WHERE fornecedorID = ? AND atividadeID = ?`
                const [resultAtividade] = await db.promise().query(sqlAtividade, [id, atividade.atividadeID])
                if (resultAtividade.length === 0) { return res.status(500).json('Error'); }
            }
        }

        // Sistemas de qualidade 
        for (const sistema of data.sistemasQualidade) {
            if (sistema.checked) {
                // Verifica se já existe registro desse dado na tabela fornecedor_sistemaqualidade
                const sqlSistemaQualidade = `SELECT * FROM fornecedor_sistemaqualidade WHERE fornecedorID = ? AND sistemaQualidadeID = ?`
                const [resultSelectSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id, sistema.sistemaQualidadeID])
                // Se ainda não houver registro, fazer insert na tabela
                if (resultSelectSistemaQualidade.length === 0) {
                    const sqlSistemaQualidade2 = `INSERT INTO fornecedor_sistemaqualidade (fornecedorID, sistemaQualidadeID) VALUES (?, ?)`
                    const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade2, [id, sistema.sistemaQualidadeID])
                    if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }
                }
            } else {
                const sqlSistemaQualidade = `DELETE FROM fornecedor_sistemaqualidade WHERE fornecedorID = ? AND sistemaQualidadeID = ?`
                const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id, sistema.sistemaQualidadeID])
                if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }
            }
        }

        // Blocos 
        for (const bloco of data.blocos) {
            // Itens 
            for (const item of bloco.itens) {
                if (item.resposta || item.observacao) {

                    console.log('==> ', item)

                    // Verifica se já existe registro em fornecedor_resposta, com o fornecedorID, parFornecedorBlocoID e itemID, se houver, faz update, senao faz insert 
                    const sqlVerificaResposta = `SELECT * FROM fornecedor_resposta WHERE fornecedorID = ? AND parFornecedorBlocoID = ? AND itemID = ?`
                    const [resultVerificaResposta] = await db.promise().query(sqlVerificaResposta, [id, bloco.parFornecedorBlocoID, item.itemID])

                    if (resultVerificaResposta.length === 0) {
                        console.log('Insere resposta')
                        // insert na tabela fornecedor_resposta
                        const sqlInsert = `INSERT INTO fornecedor_resposta (fornecedorID, parFornecedorBlocoID, itemID, resposta, respostaID, obs) VALUES (?, ?, ?, ?, ?, ?)`
                        const [resultInsert] = await db.promise().query(sqlInsert, [id, bloco.parFornecedorBlocoID, item.itemID, (item.resposta ?? ''), (item.respostaID ?? 0), (item.observacao ?? '')])
                        if (resultInsert.length === 0) { return res.status(500).json('Error'); }
                    } else {
                        console.log('Altera resposta')
                        // update na tabela fornecedor_resposta
                        const sqlUpdate = `
                        UPDATE 
                            fornecedor_resposta 
                        SET ${item.resposta ? 'resposta = ?, ' : ''} 
                            ${item.respostaID ? 'respostaID = ?, ' : ''} 
                            ${item.observacao != undefined ? 'obs = ?, ' : ''} 
                            fornecedorID = ?
                        WHERE fornecedorID = ? 
                            AND parFornecedorBlocoID = ? 
                            AND itemID = ?`
                        const [resultUpdate] = await db.promise().query(sqlUpdate, [
                            ...(item.resposta ? [item.resposta] : []),
                            ...(item.respostaID ? [item.respostaID] : []),
                            ...(item.observacao != undefined ? [item.observacao] : []),
                            id,
                            id,
                            bloco.parFornecedorBlocoID,
                            item.itemID
                        ])
                        if (resultUpdate.length === 0) { return res.status(500).json('Error'); }
                    }
                }
            }

            // Observação
            const sqlUpdateObs = `UPDATE fornecedor SET obs = ?, status = ? WHERE fornecedorID = ?`
            const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [data.obs, data.status, id])
            if (resultUpdateObs.length === 0) { return res.status(500).json('Error'); }

        }

        console.log('Até aqui ok!')
        res.status(200).json(resultHeader)

    }

    async updateData(req, res) {
        const { id } = req.params
        const data = req.body

        // Header 
        const sqlHeader = `UPDATE fornecedor SET ? WHERE fornecedorID = ${id}`;
        const [resultHeader] = await db.promise().query(sqlHeader, [data.header])
        if (resultHeader.length === 0) { return res.status(500).json('Error'); }

        // Atividades
        for (const atividade of data.atividades) {
            if (atividade.checked) {
                // Verifica se já existe registro desse dado na tabela fornecedor_atividade
                const sqlAtividade = `SELECT * FROM fornecedor_atividade WHERE fornecedorID = ? AND atividadeID = ?`
                const [resultSelectAtividade] = await db.promise().query(sqlAtividade, [id, atividade.atividadeID])
                // Se ainda não houver registro, fazer insert na tabela 
                if (resultSelectAtividade.length === 0) {
                    const sqlAtividade2 = `INSERT INTO fornecedor_atividade (fornecedorID, atividadeID) VALUES (?, ?)`
                    const [resultAtividade] = await db.promise().query(sqlAtividade2, [id, atividade.atividadeID])
                    if (resultAtividade.length === 0) { return res.status(500).json('Error'); }
                }
            } else {
                const sqlAtividade = `DELETE FROM fornecedor_atividade WHERE fornecedorID = ? AND atividadeID = ?`
                const [resultAtividade] = await db.promise().query(sqlAtividade, [id, atividade.atividadeID])
                if (resultAtividade.length === 0) { return res.status(500).json('Error'); }
            }
        }

        // Sistemas de qualidade 
        for (const sistema of data.sistemasQualidade) {
            if (sistema.checked) {
                // Verifica se já existe registro desse dado na tabela fornecedor_sistemaqualidade
                const sqlSistemaQualidade = `SELECT * FROM fornecedor_sistemaqualidade WHERE fornecedorID = ? AND sistemaQualidadeID = ?`
                const [resultSelectSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id, sistema.sistemaQualidadeID])
                // Se ainda não houver registro, fazer insert na tabela
                if (resultSelectSistemaQualidade.length === 0) {
                    const sqlSistemaQualidade2 = `INSERT INTO fornecedor_sistemaqualidade (fornecedorID, sistemaQualidadeID) VALUES (?, ?)`
                    const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade2, [id, sistema.sistemaQualidadeID])
                    if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }
                }
            } else {
                const sqlSistemaQualidade = `DELETE FROM fornecedor_sistemaqualidade WHERE fornecedorID = ? AND sistemaQualidadeID = ?`
                const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id, sistema.sistemaQualidadeID])
                if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }
            }
        }

        // Blocos 
        for (const bloco of data.blocos) {
            // Itens 
            for (const item of bloco.itens) {
                if (item.resposta || item.observacao) {
                    // Verifica se já existe registro em fornecedor_resposta, com o fornecedorID, parFornecedorBlocoID e itemID, se houver, faz update, senao faz insert 
                    const sqlVerificaResposta = `SELECT * FROM fornecedor_resposta WHERE fornecedorID = ? AND parFornecedorBlocoID = ? AND itemID = ?`
                    const [resultVerificaResposta] = await db.promise().query(sqlVerificaResposta, [id, bloco.parFornecedorBlocoID, item.itemID])

                    if (resultVerificaResposta.length === 0) {
                        console.log('Insere resposta')
                        // insert na tabela fornecedor_resposta
                        const sqlInsert = `INSERT INTO fornecedor_resposta (fornecedorID, parFornecedorBlocoID, itemID, resposta, respostaID, obs) VALUES (?, ?, ?, ?, ?, ?)`
                        const [resultInsert] = await db.promise().query(sqlInsert, [id, bloco.parFornecedorBlocoID, item.itemID, (item.resposta ?? ''), (item.respostaID ?? 0), (item.observacao ?? '')])
                        if (resultInsert.length === 0) { return res.status(500).json('Error'); }
                    } else {
                        console.log('Altera resposta')
                        // update na tabela fornecedor_resposta
                        const sqlUpdate = `
                        UPDATE 
                            fornecedor_resposta 
                        SET ${item.resposta ? 'resposta = ?, ' : ''} 
                            ${item.respostaID ? 'respostaID = ?, ' : ''} 
                            ${item.observacao != undefined ? 'obs = ?, ' : ''} 
                            fornecedorID = ?
                        WHERE fornecedorID = ? 
                            AND parFornecedorBlocoID = ? 
                            AND itemID = ?`
                        const [resultUpdate] = await db.promise().query(sqlUpdate, [
                            ...(item.resposta ? [item.resposta] : []),
                            ...(item.respostaID ? [item.respostaID] : []),
                            ...(item.observacao != undefined ? [item.observacao] : []),
                            id,
                            id,
                            bloco.parFornecedorBlocoID,
                            item.itemID
                        ])
                        if (resultUpdate.length === 0) { return res.status(500).json('Error'); }
                    }
                }
            }

            // Observação
            const sqlUpdateObs = `UPDATE fornecedor SET obs = ?, status = ? WHERE fornecedorID = ?`
            const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [data.obs, data.status, id])
            if (resultUpdateObs.length === 0) { return res.status(500).json('Error'); }

        }

        res.status(200).json(resultHeader)
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

    async getFabricas(req, res) {
        const { cnpj } = req.body;

        const sql = `
        SELECT * 
        FROM fabrica_fornecedor AS ff 
            JOIN unidade AS u ON (ff.unidadeID = u.unidadeID) 
        WHERE ff.fornecedorCnpj = "${cnpj}" AND ff.status = 1`
        const [result] = await db.promise().query(sql)

        res.status(200).json(result);
    }

    async getFornecedorByCnpj(req, res) {
        const { unidadeID, cnpj } = req.body;
        // Verifica se está vinculado como um fornecedor
        const sqlFornecedor = `
        SELECT * 
        FROM fabrica_fornecedor
        WHERE unidadeID = ? AND fornecedorCnpj = ? AND status = ?`
        const [resultFornecedor] = await db.promise().query(sqlFornecedor, [unidadeID, cnpj, 1])

        // Verifica se já possui formulário preenchido pra minha empresa
        const sqlFormulario = `
        SELECT * 
        FROM fornecedor
        WHERE unidadeID = ? AND cnpj = ?`
        const [resultFormulario] = await db.promise().query(sqlFormulario, [unidadeID, cnpj])

        const result = {
            isFornecedor: resultFornecedor.length > 0 ? true : false,
            hasFormulario: resultFormulario.length > 0 ? true : false,
        }

        console.log('respondendo com ', result)
        res.status(200).json(result);
    }

    async makeFornecedor(req, res) {
        const { unidadeID, cnpj } = req.body;

        // Verifica duplicidade 
        const sqlVerify = `
        SELECT * 
        FROM fabrica_fornecedor
        WHERE unidadeID = ? AND fornecedorCnpj = ?`
        const [resultVerify] = await db.promise().query(sqlVerify, [unidadeID, cnpj])
        if (resultVerify.length > 0) {
            return res.status(409).json({ message: 'Essa empresa já é um fornecedor desta unidade.' });
        }

        // Insere na tabela fabrica_fornecedor
        const sqlInsert = `
        INSERT INTO fabrica_fornecedor (unidadeID, fornecedorCnpj, status)
        VALUES (?, ?, ?)`
        const [resultInsert] = await db.promise().query(sqlInsert, [unidadeID, cnpj, 1])
        if (resultInsert.length === 0) { return res.status(500).json('Error'); }

        const result = {
            cnpj: cnpj,
            isFornecedor: true,
            hasFormulario: false,
        }

        res.status(200).json(result)
    }

    async fornecedorStatus(req, res) {
        const { unidadeID, cnpj, status } = req.body;

        // Verifica se já possui registro
        const sqlVerify = `
        SELECT * 
        FROM fabrica_fornecedor
        WHERE unidadeID = ? AND fornecedorCnpj = ?`
        const [resultVerify] = await db.promise().query(sqlVerify, [unidadeID, cnpj])

        if (resultVerify.length === 0) {
            // insere registro 
            const sqlInsert = `
            INSERT INTO fabrica_fornecedor (unidadeID, fornecedorCnpj, status)
            VALUES (?, ?, ?)`
            const [resultInsert] = await db.promise().query(sqlInsert, [unidadeID, cnpj, status])
        } else {
            // atualiza o status 
            const sqlUpdate = `
            UPDATE fabrica_fornecedor
            SET status = ?
            WHERE unidadeID = ? AND fornecedorCnpj = ?`
            const [resultUpdate] = await db.promise().query(sqlUpdate, [status, unidadeID, cnpj])
        }

        // Verifica se já possui formulário preenchido pra minha empresa
        const sqlFormulario = `
        SELECT * 
        FROM fornecedor
        WHERE unidadeID = ? AND cnpj = ?`
        const [resultFormulario] = await db.promise().query(sqlFormulario, [unidadeID, cnpj])

        const result = {
            isFornecedor: status === 1 ? true : false,
            hasFormulario: resultFormulario.length > 0 ? true : false,
        }

        res.status(200).json(result);
    }

    // Função que envia email para o fornecedor
    async sendMail(req, res) {
        const { data } = req.body;
        const destinatario = data.destinatario

        let assunto = 'Solicitação de Cadastro de Fornecedor'
        const html = await instructionsNewFornecedor(criptoMd5(onlyNumbers(data.cnpj.toString())), criptoMd5(data.unidadeID.toString()));

        res.status(200).json(sendMailConfig(destinatario, assunto, html))
    }


    //? Função que pega as alternativas do item
    async getItemScore(req, res) {
        const { data } = req.body;

        const sqlScore = `        
        SELECT a.parFornecedorBlocoItemID, b.*, 

            (SELECT c.pontuacao
            FROM par_fornecedor_bloco_item_pontuacao AS c 
            WHERE c.parFornecedorBlocoItemID = a.parFornecedorBlocoItemID AND c.alternativaItemID = b.alternativaItemID) AS score

        FROM par_fornecedor_bloco_item AS a
            JOIN alternativa_item AS b ON (a.alternativaID = b.alternativaID)
        WHERE a.parFornecedorBlocoItemID = ${data.parFornecedorBlocoItemID}`
        const [resultScore] = await db.promise().query(sqlScore)

        const result = {
            alternativaID: data.alternativaID,
            pontuacao: data.pontuacao,
            parFornecedorBlocoItemID: data.parFornecedorBlocoItemID,
            alternatives: resultScore,
        }
        res.status(200).json(result);
    }

    //? Função que grava o score do item do fornecedor 
    async saveItemScore(req, res) {
        const { data } = req.body;

        // Atualizar pontuação na tabela par_fornecedor_bloco_item
        const sqlUpdate = `UPDATE par_fornecedor_bloco_item SET pontuacao = ? WHERE parFornecedorBlocoItemID = ?`;
        const [resultUpdate] = await db.promise().query(sqlUpdate, [data.pontuacao, data.parFornecedorBlocoItemID]);

        const promises = data.alternatives.map(async (item) => {
            // Verifica se já existe um registro para o item
            const sqlVerify = `SELECT * FROM par_fornecedor_bloco_item_pontuacao WHERE parFornecedorBlocoItemID = ? AND alternativaItemID = ?`;
            const [resultVerify] = await db.promise().query(sqlVerify, [data.parFornecedorBlocoItemID, item.alternativaItemID]);

            if (data.pontuacao === 1) { // Habilitou a pontuação
                if (resultVerify.length > 0) {                // Atualiza o registro
                    const sqlUpdate = `UPDATE par_fornecedor_bloco_item_pontuacao SET pontuacao = ? WHERE parFornecedorBlocoItemID = ? AND alternativaItemID = ?`;
                    const [resultUpdate] = await db.promise().query(sqlUpdate, [item.score > 0 ? item.score : 0, data.parFornecedorBlocoItemID, item.alternativaItemID]);
                } else {
                    // Insere o registro
                    const sqlInsert = `INSERT INTO par_fornecedor_bloco_item_pontuacao (parFornecedorBlocoItemID, alternativaID, alternativaItemID, pontuacao) VALUES (?, ?, ?, ?)`;
                    const [result] = await db.promise().query(sqlInsert, [data.parFornecedorBlocoItemID, data.alternativaID, item.alternativaItemID, item.score > 0 ? item.score : 0]);
                }
            } else if (resultVerify.length > 0) { // Desabilitou e existe pontuação, deleta o registro
                const sqlDelete = `DELETE FROM par_fornecedor_bloco_item_pontuacao WHERE parFornecedorBlocoItemID = ? AND alternativaItemID = ?`;
                const [resultDelete] = await db.promise().query(sqlDelete, [data.parFornecedorBlocoItemID, item.alternativaItemID]);
            }
        });
        res.status(200).json('ok');
    }

}

//* Functions 
const getResultFields = async (unidadeID) => {
    const sqlFields = `
    SELECT * 
    FROM par_fornecedor AS pf 
        JOIN par_fornecedor_unidade AS pfu ON (pf.parFornecedorID = pfu.parFornecedorID) 
    WHERE pfu.unidadeID = ? 
    ORDER BY pf.ordem ASC`
    return await db.promise().query(sqlFields, [unidadeID])
}

const getResultAtividades = async (fornecedorID) => {
    const sqlAtividade = `
    SELECT a.*, 
        (SELECT IF(COUNT(*) > 0, 1, 0)
        FROM fornecedor_atividade AS fa 
        WHERE fa.atividadeID = a.atividadeID AND fa.fornecedorID = ?) AS checked
    FROM atividade AS a 
    ORDER BY a.nome ASC;`
    return await db.promise().query(sqlAtividade, [fornecedorID])
}

const getResultSistemasQualidade = async (fornecedorID) => {
    const sqlSistemaQualidade = `
    SELECT s.*, 
        (SELECT IF(COUNT(*) > 0, 1, 0)
        FROM fornecedor_sistemaqualidade AS fs
        WHERE fs.sistemaQualidadeID = s.sistemaQualidadeID AND fs.fornecedorID = ?) AS checked
    FROM sistemaqualidade AS s
    ORDER BY s.nome ASC;`
    return await db.promise().query(sqlSistemaQualidade, [fornecedorID])
}

const getBlocos = async (unidadeID) => {
    const sqlBlocos = `
    SELECT * 
    FROM par_fornecedor_bloco
    WHERE unidadeID = ? AND status = 1
    ORDER BY ordem ASC`
    return await db.promise().query(sqlBlocos, [unidadeID])
}

const getSqlItem = () => {
    const sql = `
    SELECT pfbi.*, i.*, a.nome AS alternativa,

        (SELECT fr.respostaID
        FROM fornecedor_resposta AS fr 
        WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = pfbi.parFornecedorBlocoID AND fr.itemID = pfbi.itemID) AS respostaID,

        (SELECT fr.resposta
        FROM fornecedor_resposta AS fr 
        WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = pfbi.parFornecedorBlocoID AND fr.itemID = pfbi.itemID) AS resposta,

        (SELECT fr.obs
        FROM fornecedor_resposta AS fr 
        WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = pfbi.parFornecedorBlocoID AND fr.itemID = pfbi.itemID) AS observacao

    FROM par_fornecedor_bloco_item AS pfbi 
        LEFT JOIN item AS i ON (pfbi.itemID = i.itemID)
        LEFT JOIN alternativa AS a ON (pfbi.alternativaID = a.alternativaID)
    WHERE pfbi.parFornecedorBlocoID = ?
    ORDER BY pfbi.ordem ASC`
    return sql
}

const getAlternativasSql = () => {
    const sql = `
    SELECT *
    FROM par_fornecedor_bloco_item AS pfbi 
        JOIN alternativa AS a ON (pfbi.alternativaID = a.alternativaID)
        JOIN alternativa_item AS ai ON (a.alternativaID = ai.alternativaID)
    WHERE pfbi.itemID = ?`
    return sql
}

const getSqlOtherInfos = () => {
    const sql = `
    SELECT obs, status
    FROM fornecedor
    WHERE fornecedorID = ?`
    return sql
}


module.exports = FornecedorController;