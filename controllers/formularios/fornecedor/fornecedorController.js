const db = require('../../../config/db');
const fs = require('fs');
const path = require('path');
require('dotenv/config')
const { hasPending, deleteItem, criptoMd5, onlyNumbers } = require('../../../config/defaultConfig');
const instructionsNewFornecedor = require('../../../email/template/fornecedor/instructionsNewFornecedor');
const conclusionFormFornecedor = require('../../../email/template/fornecedor/conclusionFormFornecedor');
const sendMailConfig = require('../../../config/email');
const { addFormStatusMovimentation, formatFieldsToTable, hasUnidadeID } = require('../../../defaults/functions');

//? Email
const layoutNotification = require('../../../email/template/notificacao');

class FornecedorController {
    async getModels(req, res) {
        const { unidadeID } = req.body
        const sql = `SELECT parFornecedorModeloID AS id, nome FROM par_fornecedor_modelo WHERE unidadeID = ? AND status = 1 ORDER BY nome ASC`;
        const [result] = await db.promise().query(sql, [unidadeID])
        return res.status(200).json(result);
    }

    async getProducts(req, res) {
        const { unidadeID } = req.body
        const sql = `
        SELECT produtoID AS id, nome
        FROM produto
        WHERE unidadeID = ? AND status = 1 
        ORDER BY nome ASC`;
        const [result] = await db.promise().query(sql, [unidadeID])
        return res.status(200).json(result);
    }

    async getGruposAnexo(req, res) {
        const { unidadeID } = req.body
        const sql = `
        SELECT grupoanexoID AS id, nome
        FROM grupoanexo
        WHERE unidadeID = ? AND status = 1 
        ORDER BY nome ASC`;
        const [result] = await db.promise().query(sql, [unidadeID])
        return res.status(200).json(result);
    }

    async sendNotification(req, res) {
        try {
            const { id, usuarioID, papelID, unidadeID } = req.body.auth;
            const values = req.body.values;

            if (!values || !id) { return res.status(400).json({ message: 'Erro ao enviar notificação!' }) }

            //* Envia email
            if (values.email) {
                const html = await layoutNotification(values);
                res.status(200).json(sendMailConfig(values.emailDestinatario, 'Notificação do sistema', html))
            }

            return res.status(200).json({ message: 'Notificação enviada com sucesso!' })
        } catch (error) {
            console.log(error)
        }
    }

    //* Salva os anexos do formulário na pasta uploads/anexo e insere os dados na tabela anexo
    async saveAnexo(req, res) {
        try {
            const { id } = req.params;
            let file = req.file;
            const { titulo, grupoanexoitemID, usuarioID, unidadeID, arrAnexoRemoved } = req.body;

            //? Verificar se há arquivo enviado
            if (!file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            }

            //? Anexo atual
            const sqlCurrentFile = `SELECT arquivo FROM anexo WHERE grupoAnexoItemID = ? AND unidadeID = ? AND fornecedorID = ?`;
            const [tempResultCurrentFile] = await db.promise().query(sqlCurrentFile, [grupoanexoitemID, unidadeID, id])
            const resultCurrentFile = tempResultCurrentFile[0]?.arquivo;

            //? Exclui o arquivo anterior
            if (resultCurrentFile) {
                const previousFile = path.resolve('uploads/anexos', resultCurrentFile);
                fs.unlink(previousFile, (error) => {
                    if (error) {
                        return console.error('Erro ao excluir a imagem anterior:', error);
                    } else {
                        return console.log('Imagem anterior excluída com sucesso!');
                    }
                });
            }

            if (resultCurrentFile) {
                const sqlUpdate = `UPDATE anexo SET arquivo = ?, tamanho = ?, tipo = ?, titulo = ?, dataHora = ? WHERE grupoAnexoItemID = ? AND unidadeID = ? AND fornecedorID = ?`;
                const [resultUpdate] = await db.promise().query(sqlUpdate, [
                    file.filename,
                    file.size,
                    file.mimetype,
                    titulo,
                    new Date(),
                    grupoanexoitemID,
                    unidadeID,
                    id
                ])
            } else {
                const sqlInsert = `INSERT INTO anexo(titulo, arquivo, tamanho, tipo, grupoAnexoItemID, usuarioID, unidadeID, fornecedorID, dataHora) VALUES(?,?,?,?,?,?,?,?,?)`;
                const [resultInsert] = await db.promise().query(sqlInsert, [
                    titulo,
                    file.filename,
                    file.size,
                    file.mimetype,
                    grupoanexoitemID,
                    usuarioID,
                    unidadeID,
                    id,
                    new Date()
                ])
            }

            const result = {
                path: `${process.env.BASE_URL_UPLOADS}anexos/${file.filename}`,
                nome: titulo,
                tipo: file.mimetype,
                size: file.size,
                time: new Date(),
            }

            res.status(200).json(result);

        } catch (error) {
            console.log(error)
        }
    }

    async deleteAnexo(req, res) {
        const { grupoanexoitemID, id, unidadeID, usuarioID } = req.params;

        //? Obtém o caminho do anexo atual
        const sqlCurrentFile = `SELECT arquivo FROM anexo WHERE grupoAnexoItemID = ? AND unidadeID = ? AND fornecedorID = ?`;
        const [tempResultCurrentFile] = await db.promise().query(sqlCurrentFile, [grupoanexoitemID, unidadeID, id])
        const resultCurrentFile = tempResultCurrentFile[0]?.arquivo;

        //? Remover arquivo do diretório
        if (resultCurrentFile) {
            const previousFile = path.resolve('uploads/anexos', resultCurrentFile);
            fs.unlink(previousFile, (error) => {
                if (error) {
                    return console.error('Erro ao remover o anexo:', error);
                } else {
                    return console.log('Anexo removido com sucesso!');
                }
            });
        }

        //? Remove anexo do BD
        const sqlDelete = `DELETE FROM anexo WHERE grupoAnexoItemID = ? AND unidadeID = ? AND fornecedorID = ?`;
        const [resultDelete] = await db.promise().query(sqlDelete, [grupoanexoitemID, unidadeID, id])

        res.status(200).json(resultDelete);
    }

    async getList(req, res) {
        const { unidadeID, papelID, cnpj } = req.body;

        //* Fábrica 
        if (papelID == 1) {
            if (!unidadeID) { return res.json({ message: 'Erro ao receber unidadeID!' }) }
            const sql = `
            SELECT
            f.fornecedorID AS id,
                    IF(MONTH(f.dataAvaliacao) > 0, DATE_FORMAT(f.dataAvaliacao, "%d/%m/%Y"), '--') AS data,
                    IF(f.nome <> '', f.nome, '--') AS fornecedor,
                    IF(f.cnpj <> '', f.cnpj, '--') AS cnpj,
                    IF(f.cidade <> '', CONCAT(f.cidade, '/', f.estado), '--') AS cidade,
                    IF(f.responsavel <> '', f.responsavel, '--') AS responsavel,
                    e.nome AS status,
                    e.cor
                FROM fornecedor AS f
                    LEFT JOIN unidade AS u ON(f.unidadeID = u.unidadeID)
                    LEFT JOIN status AS e  ON(f.status = e.statusID)
                WHERE f.unidadeID = ${unidadeID}
            ORDER BY f.fornecedorID DESC, f.status ASC`
            const [result] = await db.promise().query(sql)
            return res.status(200).json(result);
        }
        //* Fornecedor 
        else if (papelID == 2 && cnpj) {
            const sql = `
            SELECT
                f.fornecedorID AS id,
                IF(MONTH(f.dataAvaliacao) > 0, DATE_FORMAT(f.dataAvaliacao, "%d/%m/%Y"), '--') AS data,
                IF(u.nomeFantasia <> '', u.nomeFantasia, '--') AS fabrica,
                IF(u.cnpj <> '', u.cnpj, '--') AS cnpj,
                IF(u.cidade <> '', CONCAT(u.cidade, '/', u.uf), '--') AS cidade,
                IF(f.responsavel <> '', f.responsavel, '--') AS responsavel,
                e.nome AS status,
                e.cor
            FROM fornecedor AS f
                LEFT JOIN unidade AS u ON(f.unidadeID = u.unidadeID)
                LEFT JOIN status AS e  ON(f.status = e.statusID)
            WHERE f.cnpj = "${cnpj}"
            ORDER BY f.fornecedorID DESC, f.status ASC`
            const [result] = await db.promise().query(sql)
            return res.status(200).json(result);
        }

        return res.status(409).json({ message: 'Nenhum registro encontrado!' })

    }

    //* Retorna a estrutura do formulário configurada pra aquela unidade
    async getData(req, res) {
        try {
            const { id } = req.params; // id do formulário

            if (!id || id == 'undefined') { return res.json({ message: 'Erro ao listar formulário!' }) }

            //? obtém a unidadeID (fábrica) do formulário, pro formulário ter os campos de preenchimento de acordo com o configurado pra aquela fábrica.
            const sqlUnidade = `
            SELECT f.parFornecedorModeloID, f.unidadeID, u.nomeFantasia, f.cnpj
            FROM fornecedor AS f
                LEFT JOIN unidade AS u ON(f.unidadeID = u.unidadeID)
            WHERE f.fornecedorID = ? `
            const [resultFornecedor] = await db.promise().query(sqlUnidade, [id])
            const unidade = resultFornecedor[0]
            const modeloID = resultFornecedor[0].parFornecedorModeloID

            //? obtém os dados da unidade do fornecedor (controle de notificações)
            const sqlUnidadeFornecedor = `
            SELECT u.unidadeID, u.nomeFantasia, u.cnpj
            FROM unidade AS u
            WHERE u.cnpj = ? `
            const [resultUnidadeFornecedor] = await db.promise().query(sqlUnidadeFornecedor, [unidade.cnpj])
            unidade['fornecedor'] = resultUnidadeFornecedor[0]

            // Fields do header
            const sqlFields = `
            SELECT *
            FROM par_fornecedor AS pf 
                LEFT JOIN par_fornecedor_modelo_cabecalho AS pfmc ON (pf.parFornecedorID = pfmc.parFornecedorID)
            WHERE pfmc.parFornecedorModeloID = ? 
            ORDER BY pfmc.ordem ASC`
            const [resultFields] = await db.promise().query(sqlFields, [modeloID])

            // Varre fields, verificando se há tipo == 'int', se sim, busca opções pra selecionar no select 
            for (const alternatives of resultFields) {
                if (alternatives.tipo === 'int' && alternatives.tabela) {
                    // Busca cadastros ativos e da unidade (se houver unidadeID na tabela)
                    const sqlOptions = `
                    SELECT ${alternatives.tabela}ID AS id, nome
                    FROM ${alternatives.tabela} 
                    WHERE status = 1 ${await hasUnidadeID(alternatives.tabela) ? ` AND unidadeID = ${unidade.unidadeID} ` : ``}
                    ORDER BY nome ASC`

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
            for (const field of resultFields) {
                if (field.tabela) {
                    // Monta objeto pra preencher select 
                    // Ex.: pessoa:{
                    //     id: 1,
                    //     nome: 'Fulano'
                    // }
                    const sqlFieldData = `
                    SELECT t.${field.nomeColuna} AS id, t.nome
                    FROM fornecedor AS f 
                        JOIN ${field.tabela} AS t ON(f.${field.nomeColuna} = t.${field.nomeColuna}) 
                    WHERE f.fornecedorID = ${id} `
                    let [temp] = await db.promise().query(sqlFieldData)
                    if (temp) {
                        field[field.tabela] = temp[0]
                    }
                } else {
                    const sqlFieldData = `SELECT ${field.nomeColuna} AS coluna FROM fornecedor WHERE fornecedorID = ? `;
                    let [resultFieldData] = await db.promise().query(sqlFieldData, [id])
                    field[field.nomeColuna] = resultFieldData[0].coluna ?? ''
                }
            }

            //* GRUPOS DE ANEXO
            const sqlGruposAnexo = `
            SELECT *
            FROM fornecedor_grupoanexo AS fg
                LEFT JOIN grupoanexo AS ga ON(fg.grupoAnexoID = ga.grupoanexoID)
            WHERE fg.fornecedorID = ? AND ga.status = 1`;
            const [resultGruposAnexo] = await db.promise().query(sqlGruposAnexo, [id]);

            const gruposAnexo = [];
            for (const grupo of resultGruposAnexo) {
                //? Pega os itens do grupo atual
                const sqlItens = `SELECT * FROM grupoanexo_item WHERE grupoanexoID = ? AND status = 1`;
                const [resultGrupoItens] = await db.promise().query(sqlItens, [grupo.grupoanexoID]);

                //? Varre itens do grupo, verificando se tem anexo
                for (const item of resultGrupoItens) {
                    item.anexo = {}
                    const sqlAnexo = `SELECT * FROM anexo WHERE fornecedorID = ? AND grupoAnexoItemID = ? `
                    const [resultAnexo] = await db.promise().query(sqlAnexo, [id, item.grupoanexoitemID]);
                    if (resultAnexo.length > 0) {
                        item.anexo = {
                            exist: true,
                            anexoID: resultAnexo[0].anexoID,
                            path: `${process.env.BASE_URL_UPLOADS}anexos/${resultAnexo[0].arquivo} `,
                            nome: resultAnexo[0]?.titulo,
                            tipo: resultAnexo[0]?.tipo,
                            size: resultAnexo[0]?.tamanho,
                            time: resultAnexo[0]?.dataHora,
                        }
                    }
                }
                grupo.itens = resultGrupoItens;
                gruposAnexo.push(grupo)
            }

            const sqlBlocos = `
            SELECT *
            FROM par_fornecedor_modelo_bloco
            WHERE parFornecedorModeloID = ? AND status = 1
            ORDER BY ordem ASC`
            const [resultBlocos] = await db.promise().query(sqlBlocos, [modeloID])

            //? Blocos
            const sqlBloco = getSqlBloco()
            for (const bloco of resultBlocos) {
                const [resultBloco] = await db.promise().query(sqlBloco, [id, id, id, bloco.parFornecedorModeloBlocoID])

                //? Itens
                for (const item of resultBloco) {
                    const sqlAlternativa = getAlternativasSql()
                    const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item['parFornecedorModeloBlocoItemID']])
                    item.alternativas = resultAlternativa

                    // Cria objeto da resposta (se for de selecionar)
                    if (item?.respostaID > 0) {
                        item.resposta = {
                            id: item.respostaID,
                            nome: item.resposta
                        }
                    }
                }

                bloco.itens = resultBloco
            }

            // Observação e status
            const sqlOtherInformations = getSqlOtherInfos()
            const [resultOtherInformations] = await db.promise().query(sqlOtherInformations, [id])

            const data = {
                unidade: unidade,
                fields: resultFields,
                blocos: resultBlocos,
                grupoAnexo: gruposAnexo,
                info: {
                    obs: resultOtherInformations[0].obs,
                    status: resultOtherInformations[0].status,
                },
                link: `${process.env.BASE_URL}formularios/fornecedor?id=${id}`
            }

            res.status(200).json(data);
        } catch (error) {
            console.log(error)
        }
    }

    async insertData(req, res) {
        const data = req.body

        // Header 
        const sqlHeader = `INSERT INTO fornecedor SET ? VALUES ? `;
        const [resultHeader] = await db.promise().query(sqlHeader, [data.header])
        if (resultHeader.length === 0) { return res.status(500).json('Error'); }
        const id = resultHeader.insertId

        // Atividades
        for (const atividade of data.atividades) {
            if (atividade.checked) {
                // Verifica se já existe registro desse dado na tabela fornecedor_atividade
                const sqlAtividade = `SELECT * FROM fornecedor_atividade WHERE fornecedorID = ? AND atividadeID = ? `
                const [resultSelectAtividade] = await db.promise().query(sqlAtividade, [id, atividade.id])
                // Se ainda não houver registro, fazer insert na tabela 
                if (resultSelectAtividade.length === 0) {
                    const sqlAtividade2 = `INSERT INTO fornecedor_atividade(fornecedorID, atividadeID) VALUES(?, ?)`
                    const [resultAtividade] = await db.promise().query(sqlAtividade2, [id, atividade.id])
                    if (resultAtividade.length === 0) { return res.status(500).json('Error'); }
                }
            } else {
                const sqlAtividade = `DELETE FROM fornecedor_atividade WHERE fornecedorID = ? AND atividadeID = ? `
                const [resultAtividade] = await db.promise().query(sqlAtividade, [id, atividade.id])
                if (resultAtividade.length === 0) { return res.status(500).json('Error'); }
            }
        }

        // Sistemas de qualidade 
        for (const sistema of data.sistemasQualidade) {
            if (sistema.checked) {
                // Verifica se já existe registro desse dado na tabela fornecedor_sistemaqualidade
                const sqlSistemaQualidade = `SELECT * FROM fornecedor_sistemaqualidade WHERE fornecedorID = ? AND sistemaQualidadeID = ? `
                const [resultSelectSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id, sistema.id])
                // Se ainda não houver registro, fazer insert na tabela
                if (resultSelectSistemaQualidade.length === 0) {
                    const sqlSistemaQualidade2 = `INSERT INTO fornecedor_sistemaqualidade(fornecedorID, sistemaQualidadeID) VALUES(?, ?)`
                    const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade2, [id, sistema.id])
                    if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }
                }
            } else {
                const sqlSistemaQualidade = `DELETE FROM fornecedor_sistemaqualidade WHERE fornecedorID = ? AND sistemaQualidadeID = ? `
                const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id, sistema.id])
                if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }
            }
        }

        // Blocos 
        for (const bloco of data.blocos) {
            // Itens 
            for (const item of bloco.itens) {
                if (item.resposta || item.observacao) {

                    // Verifica se já existe registro em fornecedor_resposta, com o fornecedorID, parFornecedorBlocoID e itemID, se houver, faz update, senao faz insert 
                    const sqlVerificaResposta = `SELECT * FROM fornecedor_resposta WHERE fornecedorID = ? AND parFornecedorBlocoID = ? AND itemID = ? `
                    const [resultVerificaResposta] = await db.promise().query(sqlVerificaResposta, [id, bloco.parFornecedorBlocoID, item.itemID])

                    if (resultVerificaResposta.length === 0) {
                        // insert na tabela fornecedor_resposta
                        const sqlInsert = `INSERT INTO fornecedor_resposta(fornecedorID, parFornecedorBlocoID, itemID, resposta, respostaID, obs) VALUES(?, ?, ?, ?, ?, ?)`
                        const [resultInsert] = await db.promise().query(sqlInsert, [id, bloco.parFornecedorBlocoID, item.itemID, (item.resposta ?? ''), (item.respostaID ?? 0), (item.observacao ?? '')])
                        if (resultInsert.length === 0) { return res.status(500).json('Error'); }
                    } else {
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
                        AND itemID = ? `
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
        const sqlUpdateObs = `UPDATE fornecedor SET obs = ? WHERE fornecedorID = ? `
        const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [data.obs, id])
        if (resultUpdateObs.length === 0) { return res.status(500).json('Error'); }

        res.status(200).json(resultHeader)
    }

    async updateData(req, res) {
        const { id } = req.params
        const data = req.body.form
        const { usuarioID, papelID, unidadeID } = req.body.auth

        if (!id || id == 'undefined') { return res.json({ message: 'ID não recebido!' }); }

        const sqlSelect = `SELECT status FROM fornecedor WHERE fornecedorID = ? `
        const [resultFornecedor] = await db.promise().query(sqlSelect, [id])

        // Atualizar o header e setar o status        
        if (data.fields) {
            //* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
            let dataHeader = await formatFieldsToTable('par_fornecedor', data.fields)
            const sqlHeader = `UPDATE fornecedor SET ? WHERE fornecedorID = ${id} `;
            const [resultHeader] = await db.promise().query(sqlHeader, [dataHeader])
            if (resultHeader.length === 0) { return res.status(500).json('Error'); }
        }

        //? Blocos 
        for (const bloco of data.blocos) {
            // Itens 
            if (bloco && bloco.parFornecedorModeloBlocoID && bloco.parFornecedorModeloBlocoID > 0 && bloco.itens) {
                for (const item of bloco.itens) {
                    if (item && item.itemID && item.itemID > 0) {
                        // Verifica se já existe registro em fornecedor_resposta, com o fornecedorID, parFornecedorModeloBlocoID e itemID, se houver, faz update, senao faz insert 
                        const sqlVerificaResposta = `SELECT * FROM fornecedor_resposta WHERE fornecedorID = ? AND parFornecedorModeloBlocoID = ? AND itemID = ? `
                        const [resultVerificaResposta] = await db.promise().query(sqlVerificaResposta, [id, bloco.parFornecedorModeloBlocoID, item.itemID])

                        const resposta = item.resposta && item.resposta.nome ? item.resposta.nome : item.resposta
                        const respostaID = item.resposta && item.resposta.id > 0 ? item.resposta.id : null
                        const observacao = item.observacao != undefined ? item.observacao : ''

                        if (resposta && resultVerificaResposta.length === 0) {
                            const sqlInsert = `INSERT INTO fornecedor_resposta(fornecedorID, parFornecedorModeloBlocoID, itemID, resposta, respostaID, obs) VALUES(?, ?, ?, ?, ?, ?)`
                            const [resultInsert] = await db.promise().query(sqlInsert, [
                                id,
                                bloco.parFornecedorModeloBlocoID,
                                item.itemID,
                                resposta,
                                respostaID,
                                observacao
                            ])
                            if (resultInsert.length === 0) { return res.json('Error'); }
                        } else if (resposta && resultVerificaResposta.length > 0) {
                            const sqlUpdate = `
                            UPDATE fornecedor_resposta 
                            SET resposta = ?, respostaID = ?, obs = ?, fornecedorID = ?
                            WHERE fornecedorID = ? AND parFornecedorModeloBlocoID = ? AND itemID = ? `
                            const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                resposta,
                                respostaID,
                                observacao,
                                id,
                                id,
                                bloco.parFornecedorModeloBlocoID,
                                item.itemID
                            ])
                            if (resultUpdate.length === 0) { return res.json('Error'); }
                        }
                        else if (!resposta) {
                            const sqlDelete = `DELETE FROM fornecedor_resposta WHERE fornecedorID = ? AND parFornecedorModeloBlocoID = ? AND itemID = ? `
                            const [resultDelete] = await db.promise().query(sqlDelete, [id, bloco.parFornecedorModeloBlocoID, item.itemID])
                        }

                    }
                }

            }
        } // laço blocos..

        // Observação
        const sqlUpdateObs = `UPDATE fornecedor SET obs = ?, obsConclusao = ? WHERE fornecedorID = ? `
        const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [data.info?.obs, data?.obsConclusao, id])
        if (resultUpdateObs.length === 0) { return res.json('Error'); }

        //* Status
        //? É um fornecedor e é um status anterior, seta status pra "Em preenchimento" (30)
        const newStatus = papelID == 2 && data.status != 40 ? 30 : data.status

        const sqlUpdateStatus = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ? `
        const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [newStatus, id])

        //? Gera histórico de alteração de status (se houve alteração)
        if (resultFornecedor[0]['status'] != newStatus) {
            const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', newStatus, data?.obsConclusao)
            if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
        }

        res.status(200).json({})
    }

    //? Atualiza resultado (aprovador, aprovado parcial, reprovado)
    async updateFormStatus(req, res) {
        const { id } = req.params
        const { edit, status } = req.body.status
        const { usuarioID, papelID, unidadeID } = req.body.auth

        if (edit) {
            const sqlSelect = `SELECT status FROM fornecedor WHERE fornecedorID = ? `
            const [resultFornecedor] = await db.promise().query(sqlSelect, [id])

            // //? É uma fábrica, e formulário já foi concluído pelo fornecedor
            if (status && papelID == 1 && resultFornecedor[0]['status'] >= 40) {
                const sqlUpdateStatus = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ? `
                const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [status, id])

                //? Gera histórico de alteração de status
                const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', status, '')
                if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
            }
        }

        res.status(200).json({ message: 'Ok' })
    }

    //? Obtém os grupos de anexo do fornecedor
    async getGruposAnexo(req, res) {
        const { unidadeID } = req.body

        const sql = `
        SELECT g.grupoanexoID AS id, g.nome, g.descricao
        FROM grupoanexo AS g
            JOIN grupoanexo_parformulario AS gp ON (g.grupoanexoID = gp.grupoAnexoID)
        WHERE g.unidadeID = ? AND gp.parFormularioID = ? AND g.status = ?`
        const [result] = await db.promise().query(sql, [unidadeID, 1, 1])

        res.status(200).json(result);
    }

    //? Atualiza resultado (aprovador, aprovado parcial, reprovado)
    async changeFormStatus(req, res) {
        const { id } = req.params
        const { status, observacao } = req.body
        const { usuarioID, papelID, unidadeID } = req.body.auth

        const sqlSelect = `SELECT status FROM fornecedor WHERE fornecedorID = ? `
        const [resultFornecedor] = await db.promise().query(sqlSelect, [id])

        // //? É uma fábrica, e formulário já foi concluído pelo fornecedor
        if (status && papelID == 1) {
            const sqlUpdateStatus = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ? `
            const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [status, id])

            //? Gera histórico de alteração de status
            const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', status, observacao)
            if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
        }

        res.status(200).json({ message: 'Ok' })
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['item'],
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
            JOIN unidade AS u ON(ff.unidadeID = u.unidadeID) 
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
        WHERE unidadeID = ? AND fornecedorCnpj = ? AND status = ? `
        const [resultFornecedor] = await db.promise().query(sqlFornecedor, [unidadeID, cnpj, 1])

        // Verifica se já possui formulário preenchido pra minha empresa
        const sqlFormulario = `
        SELECT 
            f.fornecedorID, 
            pfm.parFornecedorModeloID,
            pfm.nome AS modelo,
            DATE_FORMAT(f.dataAvaliacao, "%d/%m/%Y") AS dataAvaliacao,
            (
                SELECT GROUP_CONCAT(p.nome SEPARATOR ', ')
                FROM fornecedor_produto AS fp 
                    JOIN produto AS p ON(fp.produtoID = p.produtoID)
                WHERE fp.fornecedorID = f.fornecedorID
                ORDER BY p.nome ASC
            ) AS produtos,

            (
                SELECT GROUP_CONCAT(ga.nome SEPARATOR ', ')
                FROM fornecedor_grupoanexo AS fga
                    JOIN grupoanexo AS ga ON(fga.grupoAnexoID = ga.grupoanexoID)
                WHERE fga.fornecedorID = f.fornecedorID
                ORDER BY ga.nome ASC
            ) AS gruposAnexo
        FROM fornecedor AS f
            JOIN par_fornecedor_modelo AS pfm ON(f.parFornecedorModeloID = pfm.parFornecedorModeloID)
        WHERE f.unidadeID = ? AND f.cnpj = ? 
        ORDER BY f.fornecedorID DESC
        LIMIT 1`
        const [resultFormulario] = await db.promise().query(sqlFormulario, [unidadeID, cnpj])

        // Modelo de formulário (se houver apenas 1, já vem selecionado)
        const sqlModelo = `
        SELECT *
        FROM par_fornecedor_modelo AS pfm
        WHERE pfm.unidadeID = ? AND pfm.status = 1`
        const [resultModelo] = await db.promise().query(sqlModelo, [unidadeID]);

        // Grupos de anexo 
        const sqlGruposAnexo = `
        SELECT ga.grupoanexoID AS id, ga.nome
        FROM fornecedor_grupoanexo AS fg
            LEFT JOIN grupoanexo AS ga ON(fg.grupoAnexoID = ga.grupoanexoID)
        WHERE fg.fornecedorID = ? AND ga.status = 1
        ORDER BY ga.nome ASC`;
        const [resultGruposAnexo] = await db.promise().query(sqlGruposAnexo, [resultFormulario[0]?.fornecedorID]);

        // Produtos 
        const sqlProdutos = `
        SELECT p.produtoID AS id, p.nome
        FROM fornecedor_produto AS fp
            LEFT JOIN produto AS p ON(fp.produtoID = p.produtoID)
        WHERE fp.fornecedorID = ? AND p.status = 1
        ORDER BY p.nome ASC`;
        const [resultProdutos] = await db.promise().query(sqlProdutos, [resultFormulario[0]?.fornecedorID]);

        const result = {
            new: resultFornecedor.length === 0 ? true : false,
            fornecedorID: resultFormulario[0]?.fornecedorID,
            modelo: {
                id: resultFormulario[0]?.parFornecedorModeloID ? resultFormulario[0]?.parFornecedorModeloID : resultModelo.length == 1 ? resultModelo[0]?.parFornecedorModeloID : null,
                nome: resultFormulario[0]?.modelo ? resultFormulario[0]?.modelo : resultModelo.length == 1 ? resultModelo[0]?.nome : null
            },
            dataAvaliacao: resultFormulario[0]?.dataAvaliacao,
            produtos: resultProdutos, //resultFormulario[0]?.produtos,
            gruposAnexo: resultGruposAnexo //resultFormulario[0]?.gruposAnexo,
        }

        return res.status(200).json(result);
    }

    async makeFornecedor(req, res) {
        const { usuarioID, unidadeID, papelID, values } = req.body;
        console.log("🚀 ~ usuarioID, unidadeID, papelID, values:", usuarioID, unidadeID, papelID, values)

        //? Verifica se cnpj já é um fornecedor apto
        const sqlVerify = `
        SELECT *
        FROM fabrica_fornecedor
        WHERE unidadeID = ? AND fornecedorCnpj = "${values.cnpj}"`
        const [resultVerify] = await db.promise().query(sqlVerify, [unidadeID])
        if (resultVerify.length === 0) {
            //? Insere na tabela fabrica_fornecedor 
            const sqlInsert = `
            INSERT INTO fabrica_fornecedor(unidadeID, fornecedorCnpj, status) VALUES(?, "${values.cnpj}", ?)`
            const [resultInsert] = await db.promise().query(sqlInsert, [unidadeID, 1])
            // const fabricaFornecedorID = resultInsert.insertId
        }

        //? Gera um novo formulário em branco, pro fornecedor preencher depois quando acessar o sistema
        const initialStatus = 10
        const sqlFornecedor = `
        INSERT INTO fornecedor(parFornecedorModeloID, cnpj, razaoSocial, nome, email, unidadeID, status, atual) 
        VALUES(?, "${values.cnpj}", ?, ?, ?, ?, ?, ?)`
        const [resultFornecedor] = await db.promise().query(sqlFornecedor, [values.modelo.id, values.razaoSocial, values.nome, values.email, unidadeID, initialStatus, 1])
        const fornecedorID = resultFornecedor.insertId

        //? Grava grupos de anexo do fornecedor
        if (values.gruposAnexo && values.gruposAnexo.length > 0) {
            for (const grupo of values.gruposAnexo) {
                if (grupo.id > 0) {
                    const sqlGrupo = `INSERT INTO fornecedor_grupoanexo(fornecedorID, grupoAnexoID) VALUES(?, ?)`
                    const [resultGrupo] = await db.promise().query(sqlGrupo, [fornecedorID, grupo.id])
                }
            }
        }

        //? Grava produtos do fornecedor
        if (values.produtos && values.produtos.length > 0) {
            for (const produto of values.produtos) {
                if (produto.id > 0) {
                    const sqlProduto = `INSERT INTO fornecedor_produto(fornecedorID, produtoID) VALUES(?, ?)`
                    const [resultProduto] = await db.promise().query(sqlProduto, [fornecedorID, produto.id])
                }
            }
        }

        //? Gera histórico de alteração de status
        const movimentation = await addFormStatusMovimentation(1, fornecedorID, usuarioID, unidadeID, papelID, '0', initialStatus, '')
        if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário!" }) }

        const result = {
            status: true,
            fornecedorID: fornecedorID,
            razaoSocial: values.razaoSocial,
            cnpj: values.cnpj,
            email: values.email,
            link: `${process.env.BASE_URL}formularios/fornecedor?id=${fornecedorID}`
        }

        res.status(200).json(result)
    }

    async fornecedorStatus(req, res) {
        const { unidadeID, cnpj, status } = req.body;

        // Verifica se já possui registro
        const sqlVerify = `
            SELECT *
                FROM fabrica_fornecedor
        WHERE unidadeID = ? AND fornecedorCnpj = ? `
        const [resultVerify] = await db.promise().query(sqlVerify, [unidadeID, cnpj])

        if (resultVerify.length === 0) {
            // insere registro 
            const sqlInsert = `
            INSERT INTO fabrica_fornecedor(unidadeID, fornecedorCnpj, status)
            VALUES(?, ?, ?)`
            const [resultInsert] = await db.promise().query(sqlInsert, [unidadeID, cnpj, status])
        } else {
            // atualiza o status 
            const sqlUpdate = `
            UPDATE fabrica_fornecedor
            SET status = ?
                WHERE unidadeID = ? AND fornecedorCnpj = ? `
            const [resultUpdate] = await db.promise().query(sqlUpdate, [status, unidadeID, cnpj])
        }

        // Verifica se já possui formulário preenchido pra minha empresa
        const sqlFormulario = `
        SELECT *
            FROM fornecedor
        WHERE unidadeID = ? AND cnpj = ? `
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

        // Obtem dados da fabrica
        const sqlGetDataFactory = `SELECT * FROM unidade WHERE unidadeID = "?" `
        const [resultSqlGetDataFactory] = await db.promise().query(sqlGetDataFactory, [data.unidadeID])

        // Verifica se o fornecedor já possui login
        const sql = `SELECT * FROM usuario WHERE cnpj = "${data.cnpj}" `
        const [result] = await db.promise().query(sql)
        if (result.length > 0) {
            haveLogin = true
        }

        const endereco = {
            logradouro: resultSqlGetDataFactory[0].logradouro,
            numero: resultSqlGetDataFactory[0].numero,
            complemento: resultSqlGetDataFactory[0].complemento,
            bairro: resultSqlGetDataFactory[0].bairro,
            cidade: resultSqlGetDataFactory[0].cidade,
            uf: resultSqlGetDataFactory[0].uf,
        }

        const enderecoCompleto = Object.entries(endereco).map(([key, value]) => {
            if (value) {
                return `${value}, `;
            }
        }).join('').slice(0, -2) + '.'; // Remove a última vírgula e adiciona um ponto final

        const values = {
            cnpj: criptoMd5(onlyNumbers(data.cnpj.toString())),
            unidadeID: criptoMd5(data.unidadeID.toString()),
            haveLogin,
            nomeFornecedor: data.nomeFornecedor,
            destinatario: data.destinatario,
            nomeFabricaSolicitante: resultSqlGetDataFactory[0].nomeFantasia,
            emailFabricaSolicitante: resultSqlGetDataFactory[0].email,
            cnpjFabricaSolicitante: resultSqlGetDataFactory[0].cnpj,
            enderecoSimplificadoFabricaSolicitante: `${resultSqlGetDataFactory[0].cidade}/${resultSqlGetDataFactory[0].uf}`,
            enderecoCompletoFabricaSolicitante: enderecoCompleto,
            stage: 's1',
            noBaseboard: true
        }
        //! noBaseboard => Se True mostra o rodapé com os dados da fabrica solicitante com dados da mesma, senão mostra com os dados da precisa

        let assunto = 'Avaliação de fornecedor '
        const html = await instructionsNewFornecedor(values);
        res.status(200).json(sendMailConfig(destinatario, assunto, html))
    }

    async conclusionAndSendForm(req, res) {
        const { id } = req.params;
        const { usuarioID, unidadeID, papelID } = req.body;

        //? Obtém o status atual pra setar como status anterior da movimentação
        const sqlSelect = `SELECT status FROM fornecedor WHERE fornecedorID = ? `
        const [resultFornecedor] = await db.promise().query(sqlSelect, [id])

        //? Atualiza pro status de conclusão do formulário (40)
        const newStatus = 40
        const sqlUpdate = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ? `
        const [resultUpdate] = await db.promise().query(sqlUpdate, [newStatus, id])
        if (resultUpdate.length === 0) { return res.status(201).json({ message: 'Erro ao atualizar status do formulário! ' }) }

        //? Gera histórico de alteração de status
        const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', newStatus, '')
        if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }

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
            JOIN alternativa_item AS b ON(a.alternativaID = b.alternativaID)
        WHERE a.parFornecedorBlocoItemID = ${data.parFornecedorBlocoItemID} `
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
        const sqlUpdate = `UPDATE par_fornecedor_bloco_item SET pontuacao = ? WHERE parFornecedorBlocoItemID = ? `;
        const [resultUpdate] = await db.promise().query(sqlUpdate, [data.pontuacao, data.parFornecedorBlocoItemID]);

        const promises = data.alternatives.map(async (item) => {
            // Verifica se já existe um registro para o item
            const sqlVerify = `SELECT * FROM par_fornecedor_bloco_item_pontuacao WHERE parFornecedorBlocoItemID = ? AND alternativaItemID = ? `;
            const [resultVerify] = await db.promise().query(sqlVerify, [data.parFornecedorBlocoItemID, item.alternativaItemID]);

            if (data.pontuacao === 1) { // Habilitou a pontuação
                if (resultVerify.length > 0) {                // Atualiza o registro
                    const sqlUpdate = `UPDATE par_fornecedor_bloco_item_pontuacao SET pontuacao = ? WHERE parFornecedorBlocoItemID = ? AND alternativaItemID = ? `;
                    const [resultUpdate] = await db.promise().query(sqlUpdate, [item.score > 0 ? item.score : 0, data.parFornecedorBlocoItemID, item.alternativaItemID]);
                } else {
                    // Insere o registro
                    const sqlInsert = `INSERT INTO par_fornecedor_bloco_item_pontuacao(parFornecedorBlocoItemID, alternativaID, alternativaItemID, pontuacao) VALUES(?, ?, ?, ?)`;
                    const [result] = await db.promise().query(sqlInsert, [data.parFornecedorBlocoItemID, data.alternativaID, item.alternativaItemID, item.score > 0 ? item.score : 0]);
                }
            } else if (resultVerify.length > 0) { // Desabilitou e existe pontuação, deleta o registro
                const sqlDelete = `DELETE FROM par_fornecedor_bloco_item_pontuacao WHERE parFornecedorBlocoItemID = ? AND alternativaItemID = ? `;
                const [resultDelete] = await db.promise().query(sqlDelete, [data.parFornecedorBlocoItemID, item.alternativaItemID]);
            }
        });
        res.status(200).json('ok');
    }

    //! ENVIAR PRA UM ARQUIVO PADRAO!!!
    //? Obtém o histórico de movimentações do formulário
    async getMovementHistory(req, res) {
        const { id } = req.params;
        const { parFormularioID } = req.body;

        if (id && parFormularioID) {
            const sql = `
            SELECT u.nome AS usuario, un.nomeFantasia AS unidade, m.papelID, DATE_FORMAT(m.dataHora, "%d/%m/%Y") AS data, DATE_FORMAT(m.dataHora, "%H:%ih") AS hora, m.statusAnterior, m.statusAtual, m.observacao
            FROM movimentacaoformulario AS m
                LEFT JOIN usuario AS u ON(m.usuarioID = u.usuarioID)
                LEFT JOIN unidade AS un ON(m.unidadeID = un.unidadeID)
            WHERE m.parFormularioID = ? AND m.id = ?
                ORDER BY m.movimentacaoFormularioID DESC`
            const [result] = await db.promise().query(sql, [parFormularioID, id])

            return res.status(200).json(result)
        }

        res.status(201).json({ message: 'Nenhum dado encontrado!' })
    }

    async verifyFormPending(req, res) {
        const { id } = req.params;
        const { parFormularioID } = req.body;

        //? Fornecedor
        if (parFormularioID == 1) {
            const sql = `SELECT * FROM recebimentomp WHERE fornecedorID = ? `
            const [result] = await db.promise().query(sql, [id])

            const pending = result.length === 0 ? false : true
            return res.status(200).json(pending)
        }

        res.status(200).json(true)
    }
}

//* Functions 
const getSqlBloco = () => {
    const sql = `
    SELECT pfbi.*, i.*, a.nome AS alternativa,

        (SELECT fr.respostaID
        FROM fornecedor_resposta AS fr 
        WHERE fr.fornecedorID = ? AND fr.parFornecedorModeloBlocoID = pfbi.parFornecedorModeloBlocoID AND fr.itemID = pfbi.itemID) AS respostaID,

        (SELECT fr.resposta
        FROM fornecedor_resposta AS fr 
        WHERE fr.fornecedorID = ? AND fr.parFornecedorModeloBlocoID = pfbi.parFornecedorModeloBlocoID AND fr.itemID = pfbi.itemID) AS resposta,

        (SELECT fr.obs
        FROM fornecedor_resposta AS fr 
        WHERE fr.fornecedorID = ? AND fr.parFornecedorModeloBlocoID = pfbi.parFornecedorModeloBlocoID AND fr.itemID = pfbi.itemID) AS observacao

    FROM par_fornecedor_modelo_bloco_item AS pfbi 
        LEFT JOIN item AS i ON(pfbi.itemID = i.itemID)
        LEFT JOIN alternativa AS a ON(pfbi.alternativaID = a.alternativaID)
    WHERE pfbi.parFornecedorModeloBlocoID = ? AND pfbi.status = 1
    ORDER BY pfbi.ordem ASC`
    return sql
}

const getAlternativasSql = () => {
    const sql = `
    SELECT ai.alternativaItemID AS id, ai.nome
    FROM par_fornecedor_modelo_bloco_item AS pfbi 
        JOIN alternativa AS a ON(pfbi.alternativaID = a.alternativaID)
        JOIN alternativa_item AS ai ON(a.alternativaID = ai.alternativaID)
    WHERE pfbi.parFornecedorModeloBlocoItemID = ? AND pfbi.status = 1`
    return sql
}

const getSqlOtherInfos = () => {
    const sql = `
    SELECT obs, status
    FROM fornecedor
    WHERE fornecedorID = ? `
    return sql
}

const sendMailFornecedorConclusion = async (fornecedorID) => {
    const sql = `
    SELECT ufa.razaoSocial AS fabrica, ufa.email AS emailFabrica, ufo.razaoSocial AS fornecedor, ufo.cnpj AS cnpjFornecedor
    FROM fornecedor AS f 
        JOIN unidade AS ufa ON(f.unidadeID = ufa.unidadeID)
        JOIN unidade AS ufo ON(f.cnpj = ufo.cnpj)
    WHERE f.fornecedorID = ? `
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

// varrer data.header verificando se é um objeto ou nao, se for objeto inserir o id em dataHeader, senao, inserir o valor em dataHeader
const getDataOfAllTypes = (dataFromFrontend) => {
    let dataHeader = {}
    for (const key in dataFromFrontend) {
        if (typeof dataFromFrontend[key] === 'object') {
            dataHeader[`${key} ID`] = dataFromFrontend[key].id
        } else if (dataFromFrontend[key]) {
            dataHeader[key] = dataFromFrontend[key]
        }
    }

    return dataHeader;
}

module.exports = FornecedorController;