const db = require('../../../config/db');
const path = require('path');
require('dotenv/config')
const fs = require('fs');
const { hasPending, deleteItem, criptoMd5, onlyNumbers } = require('../../../config/defaultConfig');
const instructionsNewFornecedor = require('../../../email/template/formularios/fornecedor/instructionsNewFornecedor');
const conclusionFormFornecedor = require('../../../email/template/formularios/fornecedor/conclusionFormFornecedor');
const sendMailConfig = require('../../../config/email');
const { addFormStatusMovimentation, formatFieldsToTable, hasUnidadeID } = require('../../../defaults/functions');

class FornecedorController {

    //* Salva os anexos do formulário na pasta uploads/anexo e insere os dados na tabela anexo
    async saveAnexo(req, res) {
        const { id } = req.params;
        let file = req.files;
        const { titulo, grupoAnexoItemID, usuarioID, recebimentoMpID, naoConformidadeID, unidadeID, tamanho, arrAnexoRemoved } = req.body;
        console.log("🚀 ~ grupoAnexoItemID:", grupoAnexoItemID)

        console.log("🚀 ~ files:", file)

        const sqlInsert = `INSERT INTO anexo(titulo, arquivo, tamanho, tipo, grupoAnexoItemID, usuarioID, unidadeID, fornecedorID, dataHora) VALUES (?,?,?,?,?,?,?,?,NOW())`;



        //! TODO funciona na primeira vez que grava, mas quando edita, não funciona
        if (grupoAnexoItemID.length > 1) {
            for (const index in grupoAnexoItemID) {
                const [resultInsert] = await db.promise().query(sqlInsert, [titulo[index], file[index].filename, file[index].size, file[index].mimetype, grupoAnexoItemID[index], usuarioID[index], unidadeID[index], id])
                console.log("🚀 ~ resultInsert:", resultInsert)
            }
            console.log("Vários arquivos")
        } else {
            const [resultInsert] = await db.promise().query(sqlInsert, [titulo, file[0].filename, file[0].size, file[0].mimetype, grupoAnexoItemID, usuarioID, unidadeID, id])
            console.log("🚀 ~ resultInsert:", resultInsert)
            console.log("Apenas um arquivo")
        }

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
                                f.status
            FROM fornecedor AS f
                LEFT JOIN unidade AS u ON(f.unidadeID = u.unidadeID)
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
                                f.status
            FROM fornecedor AS f
                LEFT JOIN unidade AS u ON(f.unidadeID = u.unidadeID)
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
            SELECT f.unidadeID, u.nomeFantasia
            FROM fornecedor AS f
                LEFT JOIN unidade AS u ON(f.unidadeID = u.unidadeID)
            WHERE f.fornecedorID = ${id} `
            const [resultUnidade] = await db.promise().query(sqlUnidade)
            const unidade = resultUnidade[0]

            // Fields do header
            const sqlFields = `
            SELECT *
                FROM par_fornecedor AS pf 
                LEFT JOIN par_fornecedor_unidade AS pfu ON(pf.parFornecedorID = pfu.parFornecedorID) 
            WHERE pfu.unidadeID = ?
                ORDER BY pf.ordem ASC`
            const [resultFields] = await db.promise().query(sqlFields, [unidade.unidadeID])

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
                    FROM fornecedor AS f 
                        JOIN ${field.tabela} AS t ON(f.${field.nomeColuna} = t.${field.nomeColuna}) 
                    WHERE f.fornecedorID = ${id} `
                    let [temp] = await db.promise().query(sqlData)
                    if (temp) {
                        resultData[field.tabela] = temp[0]
                    }
                }
            }

            sqlData = `SELECT ${columns.join(', ')} FROM fornecedor WHERE fornecedorID = ${id} `;
            let [temp2] = await db.promise().query(sqlData)
            resultData = { ...resultData, ...temp2[0] }

            // Categorias 
            const sqlCategoria = `
            SELECT c.categoriaID AS id, c.nome, c.status,
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM fornecedor_categoria AS fc 
                WHERE fc.categoriaID = c.categoriaID AND fc.fornecedorID = ?) AS checked
            FROM categoria AS c
            ORDER BY c.nome ASC; `
            const [resultCategoria] = await db.promise().query(sqlCategoria, [id])

            // Atividades 
            const sqlAtividade = `
            SELECT a.atividadeID AS id, a.nome, a.status,
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM fornecedor_atividade AS fa 
                WHERE fa.atividadeID = a.atividadeID AND fa.fornecedorID = ?) AS checked
            FROM atividade AS a 
            ORDER BY a.nome ASC; `
            const [resultAtividade] = await db.promise().query(sqlAtividade, [id])

            // Sistemas de qualidade 
            const sqlSistemaQualidade = `
            SELECT s.sistemaQualidadeID AS id, s.nome, s.status,
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM fornecedor_sistemaqualidade AS fs
                WHERE fs.sistemaQualidadeID = s.sistemaQualidadeID AND fs.fornecedorID = ?) AS checked
            FROM sistemaqualidade AS s
            ORDER BY s.nome ASC; `
            const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id])
            if (resultSistemaQualidade.length === 0) { return res.status(500).json('Error'); }

            //* GRUPO DE ANEXOS
            const sqlFabricaFornecedorId = `
            SELECT *
            FROM fabrica_fornecedor AS ff
            WHERE ff.unidadeID = ? AND ff.fornecedorCnpj = ?`;
            const [resultFabricaFornecedorId] = await db.promise().query(sqlFabricaFornecedorId, [unidade.unidadeID, resultData.cnpj]);

            //? Grupo: pega os grupos de anexos solicitados pra esse fornecedor
            const sqlGrupoItens = `
            SELECT *
            FROM fabrica_fornecedor_grupoanexo AS ffg
                LEFT JOIN grupoanexo AS ga ON(ffg.grupoAnexoID = ga.grupoanexoID)
            WHERE ffg.fabricaFornecedorID = ? AND ga.status = 1`;
            const [resultGrupo] = await db.promise().query(sqlGrupoItens, [resultFabricaFornecedorId[0].fabricaFornecedorID]);

            const gruposAnexo = [];
            for (const grupo of resultGrupo) {
                //? Pega os itens do grupo atual
                const sqlItens = `SELECT * FROM grupoanexo_item WHERE grupoanexoID = ? AND status = 1`;
                const [resultGrupoItens] = await db.promise().query(sqlItens, [grupo.grupoanexoID]);

                //? Varre itens do grupo, verificando se tem anexo
                for (const item of resultGrupoItens) {
                    item.anexo = {}
                    const sqlAnexo = `SELECT * FROM anexo WHERE fornecedorID = ? AND unidadeID = ? AND grupoAnexoItemID = ? `
                    const [resultAnexo] = await db.promise().query(sqlAnexo, [id, unidade.unidadeID, item.grupoanexoitemID]);
                    if (resultAnexo.length > 0) {
                        item.anexo = {
                            exist: true,
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
            console.log("🚀 ~ gruposAnexo:", gruposAnexo)

            const sqlBlocos = `
            SELECT *
                FROM par_fornecedor_bloco
            WHERE unidadeID = ? AND status = 1
            ORDER BY ordem ASC`
            const [resultBlocos] = await db.promise().query(sqlBlocos, [unidade.unidadeID])

            //? Blocos
            const sqlBloco = getSqlBloco()
            for (const bloco of resultBlocos) {
                const [resultBloco] = await db.promise().query(sqlBloco, [id, id, id, bloco.parFornecedorBlocoID])

                //? Categorias do bloco
                const sqlCategorias = `SELECT categoriaID FROM par_fornecedor_bloco_categoria WHERE parFornecedorBlocoID = ? AND unidadeID = ? `
                const [resultCategorias] = await db.promise().query(sqlCategorias, [bloco.parFornecedorBlocoID, unidade.unidadeID])

                //? Atividades do bloco
                const sqlAtividades = `SELECT atividadeID FROM par_fornecedor_bloco_atividade WHERE parFornecedorBlocoID = ? AND unidadeID = ? `
                const [resultAtividades] = await db.promise().query(sqlAtividades, [bloco.parFornecedorBlocoID, unidade.unidadeID])

                //? Itens
                for (const item of resultBloco) {
                    const sqlAlternativa = getAlternativasSql()
                    const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item['parFornecedorBlocoItemID']])
                    item.alternativas = resultAlternativa

                    // Cria objeto da resposta (se for de selecionar)
                    if (item?.respostaID > 0) {
                        item.resposta = {
                            id: item.respostaID,
                            nome: item.resposta
                        }
                    }
                }

                bloco.categorias = resultCategorias ? resultCategorias : []
                bloco.atividades = resultAtividades ? resultAtividades : []
                bloco.itens = resultBloco
            }

            // Observação e status
            const sqlOtherInformations = getSqlOtherInfos()
            const [resultOtherInformations] = await db.promise().query(sqlOtherInformations, [id])

            const data = {
                unidade: unidade,
                fields: resultFields,
                data: resultData,
                categorias: resultCategoria,
                atividades: resultAtividade,
                sistemasQualidade: resultSistemaQualidade,
                blocos: resultBlocos,
                grupoAnexo: gruposAnexo,
                info: {
                    obs: resultOtherInformations[0].obs,
                    status: resultOtherInformations[0].status,
                }
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
        const data = req.body.forms
        const { usuarioID, papelID, unidadeID } = req.body.auth

        if (!id || id == 'undefined') { return res.json({ message: 'ID não recebido!' }); }

        const sqlSelect = `SELECT status FROM fornecedor WHERE fornecedorID = ? `
        const [resultFornecedor] = await db.promise().query(sqlSelect, [id])

        // Atualizar o header e setar o status
        if (data.header) {
            //* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
            let dataHeader = await formatFieldsToTable('par_fornecedor', data.header)
            const sqlHeader = `UPDATE fornecedor SET ? WHERE fornecedorID = ${id} `;
            const [resultHeader] = await db.promise().query(sqlHeader, [dataHeader])
            if (resultHeader.length === 0) { return res.status(500).json('Error'); }
        }

        // Categorias
        for (const categoria of data.categorias) {
            if (categoria.checked) {
                // Verifica se já existe registro desse dado na tabela fornecedor_categoria
                const sqlCategoria = `SELECT * FROM fornecedor_categoria WHERE fornecedorID = ? AND categoriaID = ? `
                const [resultSelectCategoria] = await db.promise().query(sqlCategoria, [id, categoria.id])
                // Se ainda não houver registro, fazer insert na tabela 
                if (resultSelectCategoria.length === 0) {
                    const sqlCategoria2 = `INSERT INTO fornecedor_categoria(fornecedorID, categoriaID) VALUES(?, ?)`
                    const [resultCategoria] = await db.promise().query(sqlCategoria2, [id, categoria.id])
                    if (resultCategoria.length === 0) { return res.status(500).json('Error'); }
                }
            } else {
                const sqlCategoria = `DELETE FROM fornecedor_categoria WHERE fornecedorID = ? AND categoriaID = ? `
                const [resultCategoria] = await db.promise().query(sqlCategoria, [id, categoria.id])
                if (resultCategoria.length === 0) { return res.status(500).json('Error'); }
            }
        }

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


        //? Blocos 
        for (const bloco of data.blocos) {
            // Itens 
            if (bloco && bloco.parFornecedorBlocoID && bloco.parFornecedorBlocoID > 0) {
                for (const item of bloco.itens) {
                    if (item && item.itemID && item.itemID > 0) {

                        if (item?.resposta || item?.observacao) {
                            // Verifica se já existe registro em fornecedor_resposta, com o fornecedorID, parFornecedorBlocoID e itemID, se houver, faz update, senao faz insert 
                            const sqlVerificaResposta = `SELECT * FROM fornecedor_resposta WHERE fornecedorID = ? AND parFornecedorBlocoID = ? AND itemID = ? `
                            const [resultVerificaResposta] = await db.promise().query(sqlVerificaResposta, [id, bloco.parFornecedorBlocoID, item.itemID])

                            // Jonatan / Adicionado && bloco.parFornecedorBlocoID && item.itemID
                            if (resultVerificaResposta.length === 0) {
                                // insert na tabela fornecedor_resposta
                                const sqlInsert = `INSERT INTO fornecedor_resposta(fornecedorID, parFornecedorBlocoID, itemID, resposta, respostaID, obs) VALUES(?, ?, ?, ?, ?, ?)`
                                const [resultInsert] = await db.promise().query(sqlInsert, [
                                    id,
                                    bloco.parFornecedorBlocoID,
                                    item.itemID,
                                    (item.resposta?.nome ? item.resposta.nome : item.resposta ? item.resposta : ''),
                                    (item.resposta?.id > 0 ? item.resposta.id : 0),
                                    (item.observacao ?? '')
                                ])
                                if (resultInsert.length === 0) { return res.json('Error'); }
                                // Jonatan / Adicionado if (item.respostaID) {
                            } else {
                                // update na tabela fornecedor_resposta
                                const resposta = item.resposta?.id > 0 ? item.resposta.nome : item.resposta ? item.resposta : ''
                                const respostaID = item.resposta?.id > 0 ? item.resposta.id : null
                                const observacao = item.observacao != undefined ? item.observacao : ''

                                const sqlUpdate = `
        UPDATE
        fornecedor_resposta 
                                SET resposta = ?,
            respostaID = ?,
            obs = ?,
            fornecedorID = ?
                WHERE fornecedorID = ?
                    AND parFornecedorBlocoID = ?
                        AND itemID = ? `
                                const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                    resposta,
                                    respostaID,
                                    observacao,
                                    id,
                                    id,
                                    bloco.parFornecedorBlocoID,
                                    item.itemID
                                ])
                                if (resultUpdate.length === 0) { return res.json('Error'); }
                            }
                        }
                    }
                }

            }
        } // laço blocos..

        // Observação
        const sqlUpdateObs = `UPDATE fornecedor SET obs = ?, obsConclusao = ? WHERE fornecedorID = ? `
        const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [data.obs, data.obsConclusao, id])
        if (resultUpdateObs.length === 0) { return res.json('Error'); }

        //* Status
        //? É um fornecedor e é um status anterior, seta status pra "Em preenchimento" (30)
        const newStatus = papelID == 2 && data.status != 40 ? 30 : data.status

        const sqlUpdateStatus = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ? `
        const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [newStatus, id])

        //? Gera histórico de alteração de status (se houve alteração)
        if (resultFornecedor[0]['status'] != newStatus) {
            const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', newStatus)
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
                const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', status)
                if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
            }
        }

        res.status(200).json({ message: 'Ok' })
    }

    //? Atualiza resultado (aprovador, aprovado parcial, reprovado)
    async changeFormStatus(req, res) {
        const { id } = req.params
        const status = req.body.status
        const { usuarioID, papelID, unidadeID } = req.body.auth

        const sqlSelect = `SELECT status FROM fornecedor WHERE fornecedorID = ? `
        const [resultFornecedor] = await db.promise().query(sqlSelect, [id])

        // //? É uma fábrica, e formulário já foi concluído pelo fornecedor
        if (status && papelID == 1) {
            const sqlUpdateStatus = `UPDATE fornecedor SET status = ? WHERE fornecedorID = ? `
            const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [status, id])

            //? Gera histórico de alteração de status
            const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', status)
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
        SELECT *
            FROM fornecedor
        WHERE unidadeID = ? AND cnpj = ? `
        const [resultFormulario] = await db.promise().query(sqlFormulario, [unidadeID, cnpj])

        const result = {
            isFornecedor: resultFornecedor.length > 0 ? true : false,
            hasFormulario: resultFormulario.length > 0 ? true : false,
        }

        res.status(200).json(result);
    }

    async makeFornecedor(req, res) {
        const { usuarioID, unidadeID, papelID, cnpj } = req.body;

        //? Verifica duplicidade 
        const sqlVerify = `
        SELECT *
            FROM fabrica_fornecedor
        WHERE unidadeID = ? AND fornecedorCnpj = "${cnpj}"`
        const [resultVerify] = await db.promise().query(sqlVerify, [unidadeID])
        if (resultVerify.length > 0) {
            return res.status(409).json({ message: 'Essa empresa já é um fornecedor desta unidade.' });
        }

        //? Insere na tabela fabrica_fornecedor
        const sqlInsert = `
        INSERT INTO fabrica_fornecedor(unidadeID, fornecedorCnpj, status)
        VALUES(?, "${cnpj}", ?)`
        const [resultInsert] = await db.promise().query(sqlInsert, [unidadeID, 1])

        //? Gera um novo formulário em branco, pro fornecedor preencher depois quando acessar o sistema
        const initialStatus = 10
        const sqlFornecedor = `
        INSERT INTO fornecedor(cnpj, unidadeID, status, atual)
        VALUES("${cnpj}", ?, ?, ?)`
        const [resultFornecedor] = await db.promise().query(sqlFornecedor, [unidadeID, initialStatus, 1])
        const fornecedorID = resultFornecedor.insertId

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

        // Verifica se o fornecedor já possui login
        const sql = `SELECT * FROM usuario WHERE cnpj = ? `
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
        const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultFornecedor[0]['status'] ?? '0', newStatus)
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
            SELECT u.nome AS usuario, un.nomeFantasia AS unidade, m.papelID, DATE_FORMAT(m.dataHora, "%d/%m/%Y") AS data, DATE_FORMAT(m.dataHora, "%H:%ih") AS hora, m.statusAnterior, m.statusAtual
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
        WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = pfbi.parFornecedorBlocoID AND fr.itemID = pfbi.itemID) AS respostaID,

            (SELECT fr.resposta
        FROM fornecedor_resposta AS fr 
        WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = pfbi.parFornecedorBlocoID AND fr.itemID = pfbi.itemID) AS resposta,

            (SELECT fr.obs
        FROM fornecedor_resposta AS fr 
        WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = pfbi.parFornecedorBlocoID AND fr.itemID = pfbi.itemID) AS observacao

    FROM par_fornecedor_bloco_item AS pfbi 
        LEFT JOIN item AS i ON(pfbi.itemID = i.itemID)
        LEFT JOIN alternativa AS a ON(pfbi.alternativaID = a.alternativaID)
    WHERE pfbi.parFornecedorBlocoID = ?
            ORDER BY pfbi.ordem ASC`
    return sql
}

const getAlternativasSql = () => {
    const sql = `
        SELECT *
            FROM par_fornecedor_bloco_item AS pfbi 
        JOIN alternativa AS a ON(pfbi.alternativaID = a.alternativaID)
        JOIN alternativa_item AS ai ON(a.alternativaID = ai.alternativaID)
    WHERE pfbi.parFornecedorBlocoItemID = ? `
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