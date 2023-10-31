const db = require('../../../config/db');
const fs = require('fs');
const path = require('path');
require('dotenv/config')
const { addFormStatusMovimentation, formatFieldsToTable, hasUnidadeID } = require('../../../defaults/functions');

class RecebimentoMpController {
    async getList(req, res) {
        const { unidadeID } = req.params;

        if (!unidadeID) return res.status(400).json({ error: 'unidadeID não informado!' })

        const sql = `
        SELECT 
            l.recebimentoMpID AS id, 
            IF(MONTH(l.data) > 0, DATE_FORMAT(l.data, "%d/%m/%Y"), '--') AS data, 
            plm.nome AS modelo,
            p.nome AS profissional, 
            l.status
        FROM recebimentomp AS l
            JOIN par_recebimentomp_modelo AS plm ON (l.parRecebimentoMpModeloID = plm.parRecebimentoMpModeloID)
            LEFT JOIN profissional AS p ON (l.preencheProfissionalID = p.profissionalID)
        WHERE l.unidadeID = ?
        ORDER BY l.recebimentoMpID DESC, l.status ASC`
        const [result] = await db.promise().query(sql, [unidadeID])

        return res.json(result);
    }

    async getData(req, res) {
        try {
            const { id } = req.params; // id do formulário

            if (!id || id == 'undefined') { return res.json({ message: 'Erro ao listar formulário!' }) }

            const sqlResult = `
            SELECT 
                r.parRecebimentoMpModeloID, 
                r.unidadeID, 
                DATE_FORMAT(r.dataInicio, '%d/%m/%Y') AS dataInicio, 
                DATE_FORMAT(r.dataInicio, '%H:%i') AS horaInicio, 
                r.abreProfissionalID,
                pa.nome AS abreProfissionalNome,

                -- Fornecedor
                f.fornecedorID,
                CONCAT(f.nome, " (", f.cnpj, ")") AS nomeFornecedor,
                f.telefone AS telefoneFornecedor,
                CONCAT(f.cidade, "/", f.estado) AS cidadeFornecedor,
                
                DATE_FORMAT(r.data, '%Y-%m-%d') AS data, 
                DATE_FORMAT(r.data, '%H:%i') AS hora,    
                r.preencheProfissionalID, 
                pp.nome AS preencheProfissionalNome,
                
                DATE_FORMAT(r.dataConclusao, '%Y-%m-%d') AS dataConclusao, 
                DATE_FORMAT(r.dataConclusao, '%H:%i') AS horaConclusao, 
                r.aprovaProfissionalID,
                pap.nome AS aprovaProfissionalNome,

                DATE_FORMAT(r.dataFim, '%d/%m/%Y') AS dataFim, 
                DATE_FORMAT(r.dataFim, '%H:%i') AS horaFim, 
                r.finalizaProfissionalID,
                pf.nome AS finalizaProfissionalNome,

                u.nomeFantasia, 
                u.cnpj
            FROM recebimentomp AS r
                LEFT JOIN unidade AS u ON(r.unidadeID = u.unidadeID)
                LEFT JOIN profissional AS pa ON (r.abreProfissionalID = pa.profissionalID)
                LEFT JOIN profissional AS pp ON (r.preencheProfissionalID = pp.profissionalID)
                LEFT JOIN profissional AS pap ON (r.aprovaProfissionalID = pap.profissionalID)
                LEFT JOIN profissional AS pf ON (r.finalizaProfissionalID = pf.profissionalID)
                LEFT JOIN fornecedor AS f ON (r.fornecedorID = f.fornecedorID)
            WHERE r.recebimentoMpID = ? `
            const [result] = await db.promise().query(sqlResult, [id])
            const unidade = {
                parRecebimentoMpModeloID: result[0]['parRecebimentoMpModeloID'] ?? 0,
                unidadeID: result[0]['unidadeID'],
                nomeFantasia: result[0]['nomeFantasia'],
                cnpj: result[0]['cnpj']
            }
            const modeloID = result[0].parRecebimentoMpModeloID

            // Fields do header
            const sqlFields = `
            SELECT *
            FROM par_recebimentomp AS pr
                LEFT JOIN par_recebimentomp_modelo_cabecalho AS prmc ON (pr.parRecebimentoMpID = prmc.parRecebimentoMpID)
            WHERE prmc.parRecebimentoMpModeloID = ? 
            ORDER BY prmc.ordem ASC`
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
                    // Ex.: profissional:{
                    //     id: 1,
                    //     nome: 'Fulano'
                    // }
                    const sqlFieldData = `
                    SELECT t.${field.nomeColuna} AS id, t.nome
                    FROM recebimentomp AS r
                        JOIN ${field.tabela} AS t ON(r.${field.nomeColuna} = t.${field.nomeColuna}) 
                    WHERE r.recebimentoMpID = ${id} `
                    let [temp] = await db.promise().query(sqlFieldData)
                    if (temp) {
                        field[field.tabela] = temp[0]
                    }
                } else {
                    const sqlFieldData = `SELECT ${field.nomeColuna} AS coluna FROM recebimentomp WHERE recebimentoMpID = ? `;
                    let [resultFieldData] = await db.promise().query(sqlFieldData, [id])
                    field[field.nomeColuna] = resultFieldData[0].coluna ?? ''
                }
            }

            //? Produtos
            const sqlProdutos = `
            SELECT
                rp.recebimentoMpProdutoID,
                rp.quantidade,
                DATE_FORMAT(rp.dataFabricacao, '%Y-%m-%d') AS dataFabricacao,
                rp.lote,
                rp.nf,
                DATE_FORMAT(rp.dataValidade, '%Y-%m-%d') AS dataValidade,
                
                a.apresentacaoID,
                a.nome AS apresentacao
                
            FROM recebimentomp_produto AS rp
                JOIN produto AS p ON (rp.produtoID = p.produtoID)
                JOIN unidademedida AS um ON (p.unidadeMedidaID = um.unidadeMedidaID)
                LEFT JOIN apresentacao AS a ON (rp.apresentacaoID = a.apresentacaoID)
            WHERE rp.recebimentoMpID = ?
            ORDER BY p.nome ASC`
            const [resultProdutos] = await db.promise().query(sqlProdutos, [id])

            for (const produto of resultProdutos) {
                produto['apresentacao'] = produto['apresentacaoID'] > 0 ? {
                    id: produto['apresentacaoID'],
                    nome: produto['apresentacao']
                } : null
            }

            const sqlBlocos = `
            SELECT *
            FROM par_recebimentomp_modelo_bloco
            WHERE parRecebimentoMpModeloID = ? AND status = 1
            ORDER BY ordem ASC`
            const [resultBlocos] = await db.promise().query(sqlBlocos, [modeloID])

            //? Blocos
            const sqlBloco = getSqlBloco()
            for (const bloco of resultBlocos) {
                const [resultBloco] = await db.promise().query(sqlBloco, [id, id, id, bloco.parRecebimentoMpModeloBlocoID])

                //? Itens
                for (const item of resultBloco) {
                    const sqlAlternativa = getAlternativasSql()
                    const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item['parRecebimentoMpModeloBlocoItemID']])
                    item.alternativas = resultAlternativa

                    // Cria objeto da resposta (se for de selecionar)
                    if (item?.respostaID > 0) {
                        item.resposta = {
                            id: item.respostaID,
                            nome: item.resposta
                        }
                    }

                    // Obter os anexos vinculados a essa resposta
                    const sqlRespostaAnexos = `
                    SELECT io.itemOpcaoID, io.anexo, io.bloqueiaFormulario, io.observacao, ioa.itemOpcaoAnexoID, ioa.nome, ioa.obrigatorio
                    FROM item_opcao AS io 
                        LEFT JOIN item_opcao_anexo AS ioa ON (io.itemOpcaoID = ioa.itemOpcaoID)
                    WHERE io.itemID = ? AND io.alternativaItemID = ?`
                    const [resultRespostaAnexos] = await db.promise().query(sqlRespostaAnexos, [item.itemID, item?.respostaID ?? 0])

                    if (resultRespostaAnexos.length > 0) {
                        for (const respostaAnexo of resultRespostaAnexos) {
                            //? Verifica se cada anexo exigido existe 1 ou mais arquivos anexados
                            const sqlArquivosAnexadosResposta = `
                            SELECT * 
                            FROM anexo AS a 
                                JOIN anexo_busca AS ab ON (a.anexoID = ab.anexoID)
                            WHERE ab.recebimentoMpID = ? AND ab.parRecebimentoMpModeloBlocoID = ? AND ab.itemOpcaoAnexoID = ?`
                            const [resultArquivosAnexadosResposta] = await db.promise().query(sqlArquivosAnexadosResposta, [id, bloco.parRecebimentoMpModeloBlocoID, respostaAnexo.itemOpcaoAnexoID])

                            let anexos = []
                            for (const anexo of resultArquivosAnexadosResposta) {
                                const objAnexo = {
                                    exist: true,
                                    anexoID: anexo.anexoID,
                                    path: `${process.env.BASE_URL_API}${anexo.diretorio}${anexo.arquivo} `,
                                    nome: anexo.titulo,
                                    tipo: anexo.tipo,
                                    size: anexo.tamanho,
                                    time: anexo.dataHora
                                }
                                anexos.push(objAnexo)
                            }

                            respostaAnexo['anexos'] = anexos ?? []
                        }
                    }

                    item['respostaConfig'] = {
                        'anexo': resultRespostaAnexos[0]?.anexo ?? 0,
                        'bloqueiaFormulario': resultRespostaAnexos[0]?.bloqueiaFormulario ?? 0,
                        'observacao': resultRespostaAnexos[0]?.observacao ?? 0,
                        'anexosSolicitados': resultRespostaAnexos ?? []
                    }
                }

                bloco.itens = resultBloco
            }

            // Observação e status
            const sqlOtherInformations = getSqlOtherInfos()
            const [resultOtherInformations] = await db.promise().query(sqlOtherInformations, [id])

            //* Última movimentação do formulário
            const sqlLastMovimentation = `
            SELECT 
                u.nome, 
                un.nomeFantasia, 
                s1.nome AS statusAnterior, 
                s2.nome AS statusAtual,
                DATE_FORMAT(m.dataHora, '%d/%m/%Y %H:%i') AS dataHora, 
                m.observacao
            FROM movimentacaoformulario AS m
                JOIN usuario AS u ON (m.usuarioID = u.usuarioID)
                JOIN unidade AS un ON (m.unidadeID = un.unidadeID)
                LEFT JOIN status AS s1 ON (s1.statusID = m.statusAnterior)
                LEFT JOIN status AS s2 ON (s2.statusID = m.statusAtual)
            WHERE m.parFormularioID = 2 AND m.id = ?
            ORDER BY m.movimentacaoFormularioID DESC 
            LIMIT 1`
            const [resultLastMovimentation] = await db.promise().query(sqlLastMovimentation, [id])

            //? Cabeçalho do modelo do formulário 
            const sqlCabecalhoModelo = `
            SELECT cabecalho
            FROM par_recebimentomp_modelo
            WHERE parRecebimentoMpModeloID = ?`
            const [resultCabecalhoModelo] = await db.promise().query(sqlCabecalhoModelo, [modeloID])

            const data = {
                unidade: unidade,
                fieldsHeader: {
                    //? Fixos
                    abertoPor: {
                        dataInicio: result[0].dataInicio,
                        horaInicio: result[0].horaInicio,
                        profissional: result[0].abreProfissionalID > 0 ? {
                            id: result[0].abreProfissionalID,
                            nome: result[0].abreProfissionalNome
                        } : null
                    },
                    //? Fields                    
                    data: result[0].data,
                    hora: result[0].hora,
                    profissional: result[0].preencheProfissionalID > 0 ? {
                        id: result[0].preencheProfissionalID,
                        nome: result[0].preencheProfissionalNome
                    } : null,
                    fornecedor: result[0].fornecedorID > 0 ? {
                        id: result[0].fornecedorID,
                        nome: result[0].nomeFornecedor,
                        telefone: result[0].telefoneFornecedor,
                        cidade: result[0].cidadeFornecedor
                    } : null
                },
                fieldsFooter: {
                    concluded: result[0].dataFim ? true : false,

                    dataConclusao: result[0].dataConclusao,
                    horaConclusao: result[0].horaConclusao,
                    profissional: result[0].aprovaProfissionalID > 0 ? {
                        id: result[0].aprovaProfissionalID,
                        nome: result[0].aprovaProfissionalNome
                    } : null,

                    conclusion: {
                        dataFim: result[0].dataFim,
                        horaFim: result[0].horaFim,
                        profissional: result[0].finalizaProfissionalID > 0 ? {
                            id: result[0].finalizaProfissionalID,
                            nome: result[0].finalizaProfissionalNome
                        } : null
                    }
                },
                fields: resultFields,
                produtos: resultProdutos ?? [],
                blocos: resultBlocos ?? [],
                grupoAnexo: [],
                ultimaMovimentacao: resultLastMovimentation[0] ?? null,
                info: {
                    obs: resultOtherInformations[0].obs,
                    status: resultOtherInformations[0].status,
                    cabecalhoModelo: resultCabecalhoModelo[0].cabecalho
                },
                link: `${process.env.BASE_URL}formularios/recebimento-mp?id=${id}`
            }

            res.status(200).json(data);
        } catch (error) {
            console.log(error)
        }
    }

    async updateData(req, res) {
        const { id } = req.params
        const data = req.body.form
        const { usuarioID, papelID, unidadeID } = req.body.auth

        if (!id || id == 'undefined') { return res.json({ message: 'ID não recebido!' }); }

        const sqlSelect = `SELECT status FROM recebimentomp WHERE recebimentoMpID = ? `
        const [resultStatus] = await db.promise().query(sqlSelect, [id])

        //? Atualiza header e footer fixos
        const sqlStaticlHeader = `
        UPDATE recebimentomp SET data = ?, profissionalID = ?, fornecedorID = ?, 
        WHERE recebimentoMpID = ${id}`
        const [resultStaticHeader] = await db.promise().query(sqlStaticlHeader, [
            data.fieldsHeader?.data ? `${data.fieldsHeader.data} ${data.fieldsHeader.hora}` : null,
            data.fieldsHeader.profissional.id ?? null,
            data.fieldsHeader.fornecedor.id ?? null
        ])

        //? Atualizar o header dinâmico e setar o status        
        if (data.fields) {
            //* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
            let dataHeader = await formatFieldsToTable('par_recebimentomp', data.fields)
            const sqlHeader = `UPDATE recebimentomp SET ? WHERE recebimentoMpID = ${id} `;
            const [resultHeader] = await db.promise().query(sqlHeader, [dataHeader])
            if (resultHeader.length === 0) { return res.status(500).json('Error'); }
        }

        //? Blocos 
        for (const bloco of data.blocos) {
            // Itens 
            if (bloco && bloco.parRecebimentoMpModeloBlocoID && bloco.parRecebimentoMpModeloBlocoID > 0 && bloco.itens) {
                for (const item of bloco.itens) {
                    if (item && item.itemID && item.itemID > 0) {
                        // Verifica se já existe registro em recebimentomp_resposta, com o recebimentompID, parRecebimentoMpModeloBlocoID e itemID, se houver, faz update, senao faz insert 
                        const sqlVerificaResposta = `SELECT * FROM recebimentomp_resposta WHERE recebimentoMpID = ? AND parRecebimentoMpModeloBlocoID = ? AND itemID = ? `
                        const [resultVerificaResposta] = await db.promise().query(sqlVerificaResposta, [id, bloco.parRecebimentoMpModeloBlocoID, item.itemID])

                        const resposta = item.resposta && item.resposta.nome ? item.resposta.nome : item.resposta
                        const respostaID = item.resposta && item.resposta.id > 0 ? item.resposta.id : null
                        const observacao = item.observacao != undefined ? item.observacao : ''

                        if (resposta && resultVerificaResposta.length === 0) {
                            const sqlInsert = `INSERT INTO recebimentomp_resposta(recebimentoMpID, parRecebimentoMpModeloBlocoID, itemID, resposta, respostaID, obs) VALUES(?, ?, ?, ?, ?, ?)`
                            const [resultInsert] = await db.promise().query(sqlInsert, [
                                id,
                                bloco.parRecebimentoMpModeloBlocoID,
                                item.itemID,
                                resposta,
                                respostaID,
                                observacao
                            ])
                            if (resultInsert.length === 0) { return res.json('Error'); }
                        } else if (resposta && resultVerificaResposta.length > 0) {
                            const sqlUpdate = `
                            UPDATE recebimentomp_resposta 
                            SET resposta = ?, respostaID = ?, obs = ?, recebimentoMpID = ?
                            WHERE recebimentoMpID = ? AND parRecebimentoMpModeloBlocoID = ? AND itemID = ? `
                            const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                resposta,
                                respostaID,
                                observacao,
                                id,
                                id,
                                bloco.parRecebimentoMpModeloBlocoID,
                                item.itemID
                            ])
                            if (resultUpdate.length === 0) { return res.json('Error'); }
                        }
                        else if (!resposta) {
                            const sqlDelete = `DELETE FROM recebimentomp_resposta WHERE recebimentoMpID = ? AND parRecebimentoMpModeloBlocoID = ? AND itemID = ? `
                            const [resultDelete] = await db.promise().query(sqlDelete, [id, bloco.parRecebimentoMpModeloBlocoID, item.itemID])
                        }
                    }
                }

            }
        } // laço blocos..

        // Observação
        const sqlUpdateObs = `UPDATE recebimentomp SET obs = ?, obsConclusao = ? WHERE recebimentoMpID = ? `
        const [resultUpdateObs] = await db.promise().query(sqlUpdateObs, [data.info?.obs, data?.obsConclusao, id])
        if (resultUpdateObs.length === 0) { return res.json('Error'); }

        //* Status
        //? É um recebimentomp e é um status anterior, seta status pra "Em preenchimento" (30)
        const newStatus = data.status < 30 ? 30 : data.status

        const sqlUpdateStatus = `UPDATE recebimentomp SET status = ? WHERE recebimentoMpID = ? `
        const [resultUpdateStatus] = await db.promise().query(sqlUpdateStatus, [newStatus, id])

        //? Gera histórico de alteração de status (se houve alteração)
        if (resultStatus[0]['status'] != newStatus) {
            const movimentation = await addFormStatusMovimentation(1, id, usuarioID, unidadeID, papelID, resultStatus[0]['status'] ?? '0', newStatus, data?.obsConclusao)
            if (!movimentation) { return res.status(201).json({ message: "Erro ao atualizar status do formulário! " }) }
        }

        res.status(200).json({})
    }
}

//* Obtém colunas
const getFields = async (parRecebimentoMpModeloID, unidadeID) => {
    const sqlFields = `
    SELECT * 
    FROM par_recebimentomp AS pl
        JOIN par_recebimentomp_modelo_cabecalho AS plmc ON (plmc.parRecebimentoMpID = pl.parRecebimentoMpID)
        JOIN par_recebimentomp_modelo AS plm ON (plm.parRecebimentoMpModeloID = plmc.parRecebimentoMpModeloID)
    WHERE plm.parRecebimentoMpModeloID = ?`
    const [resultFields] = await db.promise().query(sqlFields, [parRecebimentoMpModeloID])
    if (resultFields.length === 0) { return res.json({ message: 'Nenhum campo encontrado' }) }

    // Varre fields, verificando se há tipo == 'int', se sim, busca opções pra selecionar no select 
    for (const alternatives of resultFields) {
        if (alternatives.tipo === 'int' && alternatives.tabela) {
            // Busca cadastros ativos e da unidade (se houver unidadeID na tabela)
            let sqlOptions = ``
            if (alternatives.tabela == 'fornecedor') {
                // sqlOptions = `
                // SELECT MAX(fornecedorID) AS id, nome, cnpj
                // FROM fornecedor
                // WHERE status >= 60 AND unidadeID = ${unidadeID}
                // GROUP BY cnpj
                // ORDER BY nome ASC`
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


//* Obtém estrutura dos blocos e itens
const getBlocks = async (id, parRecebimentoMpModeloID) => {
    const sqlBlocos = `
    SELECT * 
    FROM par_recebimentomp_modelo_bloco
    WHERE parRecebimentoMpModeloID = ? AND status = 1
    ORDER BY ordem ASC`
    const [resultBlocos] = await db.promise().query(sqlBlocos, [parRecebimentoMpModeloID])

    // Itens
    const sqlItem = `
    SELECT plmbi.*, i.*, a.nome AS alternativa,
	
        (SELECT lr.respostaID
        FROM recebimentomp_resposta AS lr 
        WHERE lr.recebimentoMpID = 1 AND lr.parRecebimentoMpModeloBlocoID = plmbi.parRecebimentoMpModeloBlocoID AND lr.itemID = plmbi.itemID
        LIMIT 1) AS respostaID,
        
        (SELECT lr.resposta
        FROM recebimentomp_resposta AS lr 
        WHERE lr.recebimentoMpID = 1 AND lr.parRecebimentoMpModeloBlocoID = plmbi.parRecebimentoMpModeloBlocoID AND lr.itemID = plmbi.itemID
        LIMIT 1) AS resposta,
        
        (SELECT lr.obs
        FROM recebimentomp_resposta AS lr 
        WHERE lr.recebimentoMpID = 1 AND lr.parRecebimentoMpModeloBlocoID = plmbi.parRecebimentoMpModeloBlocoID AND lr.itemID = plmbi.itemID
        LIMIT 1) AS observacao

    FROM par_recebimentomp_modelo_bloco_item AS plmbi
        LEFT JOIN item AS i ON (plmbi.itemID = i.itemID)
        LEFT JOIN alternativa AS a ON (i.alternativaID = a.alternativaID)
    WHERE plmbi.parRecebimentoMpModeloBlocoID = ? AND plmbi.status = 1
    ORDER BY plmbi.ordem ASC`
    for (const item of resultBlocos) {
        const [resultItem] = await db.promise().query(sqlItem, [id, id, id, item.parRecebimentoMpModeloBlocoID])

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
            SELECT ai.alternativaItemID AS id, ai.nome
            FROM par_recebimentomp_modelo_bloco_item AS plmbi 
                JOIN item AS i ON (plmbi.itemID = i.itemID)
                JOIN alternativa AS a ON (i.alternativaID = a.alternativaID)
                JOIN alternativa_item AS ai ON (a.alternativaID = ai.alternativaID)
            WHERE plmbi.parRecebimentoMpModeloBlocoItemID = ?`
            const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item2.parRecebimentoMpModeloBlocoItemID])
            item2.alternativas = resultAlternativa
        }

        item.itens = resultItem
    }

    return resultBlocos
}

const getSqlBloco = () => {
    const sql = `
    SELECT prbi.*, i.*, a.nome AS alternativa,

        (SELECT rr.respostaID
        FROM recebimentomp_resposta AS rr 
        WHERE rr.recebimentoMpID = ? AND rr.parRecebimentoMpModeloBlocoID = prbi.parRecebimentoMpModeloBlocoID AND rr.itemID = prbi.itemID) AS respostaID,

        (SELECT rr.resposta
        FROM recebimentomp_resposta AS rr 
        WHERE rr.recebimentoMpID = ? AND rr.parRecebimentoMpModeloBlocoID = prbi.parRecebimentoMpModeloBlocoID AND rr.itemID = prbi.itemID) AS resposta,

        (SELECT rr.obs
        FROM recebimentomp_resposta AS rr 
        WHERE rr.recebimentoMpID = ? AND rr.parRecebimentoMpModeloBlocoID = prbi.parRecebimentoMpModeloBlocoID AND rr.itemID = prbi.itemID) AS observacao

    FROM par_recebimentomp_modelo_bloco_item AS prbi 
        LEFT JOIN item AS i ON(prbi.itemID = i.itemID)
        LEFT JOIN alternativa AS a ON(i.alternativaID = a.alternativaID)
    WHERE prbi.parRecebimentoMpModeloBlocoID = ? AND prbi.status = 1
    ORDER BY prbi.ordem ASC`
    return sql
}

const getAlternativasSql = () => {
    const sql = `
    SELECT ai.alternativaItemID AS id, ai.nome
    FROM par_recebimentomp_modelo_bloco_item AS prbi 
    	JOIN item AS i ON (prbi.itemID = i.itemID)
        JOIN alternativa AS a ON(i.alternativaID = a.alternativaID)
        JOIN alternativa_item AS ai ON(a.alternativaID = ai.alternativaID)
    WHERE prbi.parRecebimentoMpModeloBlocoItemID = ? AND prbi.status = 1`
    return sql
}

const getSqlOtherInfos = () => {
    const sql = `
    SELECT obs, status
    FROM recebimentomp
    WHERE recebimentoMpID = ? `
    return sql
}

module.exports = RecebimentoMpController;