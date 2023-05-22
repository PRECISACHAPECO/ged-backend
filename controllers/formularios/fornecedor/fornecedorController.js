const db = require('../../../config/db');
const { hasPending, deleteItem, criptoMd5, onlyNumbers } = require('../../../config/defaultConfig');
const instructionsNewFornecedor = require('../../../email/template/formularios/fornecedor/instructionsNewFornecedor');
const conclusionFormFornecedor = require('../../../email/template/formularios/fornecedor/conclusionFormFornecedor');
const sendMailConfig = require('../../../config/email');
const { addFormStatusMovimentation } = require('../../../defaults/functions');

class FornecedorController {
    async getList(req, res) {
        const { unidadeID, papelID, cnpj } = req.body;

        //* Fábrica 
        if (papelID == 1) {
            const sql = `
            SELECT f.fornecedorID AS id, f.cnpj, f.nome AS fantasia, f.cidade, f.estado, f.telefone, f.status, u.nomeFantasia AS fabrica
            FROM fornecedor AS f
                LEFT JOIN unidade AS u ON (f.unidadeID = u.unidadeID)
            WHERE f.unidadeID = ${unidadeID}`
            const [result] = await db.promise().query(sql)
            res.status(200).json(result);
        }
        //* Fornecedor 
        else if (papelID == 2 && cnpj) {
            const sql = `
            SELECT f.fornecedorID AS id, f.cnpj, f.nome, f.cidade, f.estado, f.telefone, f.status, u.nomeFantasia AS fabrica
            FROM fornecedor AS f
                LEFT JOIN unidade AS u ON (f.unidadeID = u.unidadeID)
            WHERE f.cnpj = "${cnpj}"`
            const [result] = await db.promise().query(sql)
            res.status(200).json(result);
        }
    }

    //* Retorna a estrutura do formulário configurada pra aquela unidade
    async getData(req, res) {
        const { id } = req.params; // id do formulário

        //? obtém a unidadeID (fábrica) do formulário, pro formulário ter os campos de preenchimento de acordo com o configurado pra aquela fábrica.
        const sqlUnidade = `
        SELECT f.unidadeID, u.nomeFantasia
        FROM fornecedor AS f
            LEFT JOIN unidade AS u ON (f.unidadeID = u.unidadeID)
        WHERE f.fornecedorID = ${id}`
        const [resultUnidade] = await db.promise().query(sqlUnidade)
        const unidade = resultUnidade[0]

        // Fields do header
        const sqlFields = `
        SELECT * 
        FROM par_fornecedor AS pf 
            LEFT JOIN par_fornecedor_unidade AS pfu ON (pf.parFornecedorID = pfu.parFornecedorID) 
        WHERE pfu.unidadeID = ? 
        ORDER BY pf.ordem ASC`
        const [resultFields] = await db.promise().query(sqlFields, [unidade.unidadeID])

        // Varrer result, pegando nomeColuna e inserir em um array 
        const columns = resultFields.map(row => row.nomeColuna);

        // Montar select na tabela fornecedor, onde as colunas do select serão as colunas do array columns
        const sqlData = `SELECT ${columns.join(', ')} FROM fornecedor WHERE fornecedorID = ?`;
        const [resultData] = await db.promise().query(sqlData, [id])

        // Atividades 
        const sqlAtividade = `
        SELECT a.*, 
            (SELECT IF(COUNT(*) > 0, 1, 0)
            FROM fornecedor_atividade AS fa 
            WHERE fa.atividadeID = a.atividadeID AND fa.fornecedorID = ?) AS checked
        FROM atividade AS a 
        ORDER BY a.nome ASC;`
        const [resultAtividade] = await db.promise().query(sqlAtividade, [id])

        // Sistemas de qualidade 
        const sqlSistemaQualidade = `
        SELECT s.*, 
            (SELECT IF(COUNT(*) > 0, 1, 0)
            FROM fornecedor_sistemaqualidade AS fs
            WHERE fs.sistemaQualidadeID = s.sistemaQualidadeID AND fs.fornecedorID = ?) AS checked
        FROM sistemaqualidade AS s
        ORDER BY s.nome ASC;`
        const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id])
        if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }

        // Blocos 
        const sqlBlocos = `
        SELECT * 
        FROM par_fornecedor_bloco
        WHERE unidadeID = ? AND status = 1
        ORDER BY ordem ASC`
        const [resultBlocos] = await db.promise().query(sqlBlocos, [unidade.unidadeID])

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
            unidade: unidade,
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
        }

        // Observação
        const sqlUpdateObs = `UPDATE fornecedor SET obs = ? WHERE fornecedorID = ?`
        const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [data.obs, id])
        if (resultUpdateObs.length === 0) { return res.status(500).json('Error'); }

        res.status(200).json(resultHeader)
    }

    async updateData(req, res) {
        const { id } = req.params
        const data = req.body.forms
        const { usuarioID, papelID, unidadeID } = req.body.auth

        const sqlSelect = `SELECT status FROM fornecedor WHERE fornecedorID = ?`
        const [resultFornecedor] = await db.promise().query(sqlSelect, [id])

        // Atualizar o header e setar o status
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
        } // laço blocos..

        // Observação
        const sqlUpdateObs = `UPDATE fornecedor SET obs = ? WHERE fornecedorID = ?`
        const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [data.obs, id])
        if (resultUpdateObs.length === 0) { return res.status(500).json('Error'); }

        // //* Status 
        // let statusUpdate = null
        // //? É uma fábrica, e formulário já foi concluído pelo fornecedor
        // if (data.status && papelID == 1 && resultFornecedor[0]['status'] >= 40) {
        //     statusUpdate = data.status
        // }
        // //? É um fornecedor e alterou o formulário, seta status pra "Em preenchimento"
        // else if (papelID == 2) {
        //     statusUpdate = 30
        // }
        // if (statusUpdate && statusUpdate > 0) {
        //     const sqlUpdateStatus = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ?`
        //     const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [statusUpdate, id])

        //     //? Gera histórico de alteração de status
        //     const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', statusUpdate)
        //     if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
        // }

        res.status(200).json(resultHeader)
    }

    //? Atualiza resultado (aprovador, aprovado parcial, reprovado)
    async updateFormStatus(req, res) {
        const { id } = req.params
        const status = req.body.status
        const { usuarioID, papelID, unidadeID } = req.body.auth
        console.log("🚀 ~ status:::", status)

        // const sqlSelect = `SELECT status FROM fornecedor WHERE fornecedorID = ?`
        // const [resultFornecedor] = await db.promise().query(sqlSelect, [id])

        // //? É uma fábrica, e formulário já foi concluído pelo fornecedor
        // if (data.status && papelID == 1 && resultFornecedor[0]['status'] >= 40) {
        //     const sqlUpdateStatus = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ?`
        //     const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [data.status, id])

        //     //? Gera histórico de alteração de status
        //     const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', data.status)
        //     if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
        // }

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
        const { usuarioID, unidadeID, papelID, cnpj } = req.body;

        // Verifica duplicidade 
        const sqlVerify = `
        SELECT * 
        FROM fabrica_fornecedor
        WHERE unidadeID = ? AND fornecedorCnpj = "?"`
        const [resultVerify] = await db.promise().query(sqlVerify, [unidadeID, cnpj])
        if (resultVerify.length > 0) {
            return res.status(409).json({ message: 'Essa empresa já é um fornecedor desta unidade.' });
        }

        // Insere na tabela fabrica_fornecedor
        const sqlInsert = `
        INSERT INTO fabrica_fornecedor (unidadeID, fornecedorCnpj, status)
        VALUES (?, "?", ?)`
        const [resultInsert] = await db.promise().query(sqlInsert, [unidadeID, cnpj, 1])
        // if (resultInsert.length === 0) { return res.status(500).json('Error'); }

        // Gera um novo formulário em branco, pro fornecedor preencher depois quando acessar o sistema
        const initialStatus = 10
        const sqlFornecedor = `
        INSERT INTO fornecedor (cnpj, unidadeID, status, atual)
        VALUES ("?", ?, ?, ?)`
        const [resultFornecedor] = await db.promise().query(sqlFornecedor, [cnpj, unidadeID, initialStatus, 1])
        const fornecedorID = resultFornecedor.insertId
        console.log("🚀 ~ fornecedorID:", fornecedorID)

        //? Gera histórico de alteração de status
        const movimentation = await addFormStatusMovimentation(1, fornecedorID, usuarioID, unidadeID, papelID, '0', initialStatus)
        if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário!" }) }

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

    //? Função que envia email para o fornecedor
    async sendMail(req, res) {
        const { data } = req.body;
        const destinatario = data.destinatario
        let haveLogin = false

        // Verifica se o fornecedor já possui login
        const sql = `SELECT * FROM usuario WHERE cnpj = ?`
        const [result] = await db.promise().query(sql, [data.cnpj])
        if (result.length > 0) {
            haveLogin = true
        }

        let assunto = 'Solicitação de Cadastro de Fornecedor'
        const html = await instructionsNewFornecedor(criptoMd5(onlyNumbers(data.cnpj.toString())), criptoMd5(data.unidadeID.toString()), haveLogin);
        res.status(200).json(sendMailConfig(destinatario, assunto, html))
    }

    async conclusionAndSendForm(req, res) {
        const { id } = req.params;

        //? Atualiza pro status de conclusão do formulário (40)
        console.log('conclusionAndSendForm: ', id)
        const sqlUpdate = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ?`
        const [resultUpdate] = await db.promise().query(sqlUpdate, [40, id])
        if (resultUpdate.length === 0) { return res.status(201).json({ message: 'Erro ao atualizar status do formulário! ' }) }

        //? Envia e-mail pra fábrica
        const sentMail = sendMailFornecedorConclusion(id)
        if (!sentMail) { return res.status(202).json({ message: 'Erro ao enviar e-mail para a fábrica!' }) }

        res.status(200).json({ message: 'Ok' })
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

const sendMailFornecedorConclusion = async (fornecedorID) => {
    const sql = `
    SELECT ufa.razaoSocial AS fabrica, ufa.email AS emailFabrica, ufo.razaoSocial AS fornecedor, ufo.cnpj AS cnpjFornecedor
    FROM fornecedor AS f 
        JOIN unidade AS ufa ON (f.unidadeID = ufa.unidadeID)
        JOIN unidade AS ufo ON (f.cnpj = ufo.cnpj)
    WHERE f.fornecedorID = ?`
    const [result] = await db.promise().query(sql, [fornecedorID])

    if (result.length > 0 && result[0]['emailFabrica']) {
        const destinatario = result[0]['emailFabrica']
        let assunto = 'Fornecedor enviou formulário'
        const data = {
            fabrica: {
                razaoSocial: result[0]['fabrica']
            },
            fornecedor: {
                fornecedorID: fornecedorID,
                razaoSocial: result[0]['fornecedor'],
                cnpj: result[0]['cnpjFornecedor']
            }
        }

        const html = await conclusionFormFornecedor(data);
        await sendMailConfig(destinatario, assunto, html)

        return true
    }

    return false; // fornecedor não encontrado
}

module.exports = FornecedorController;