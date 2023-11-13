const db = require('../../../../config/db');
const fs = require('fs');
const path = require('path');
require('dotenv/config')

class RecebimentoMpController {
    async getList(req, res) {
        const { unidadeID } = req.params;
        console.log("🚀 ~ unidadeID:", unidadeID)

        if (!unidadeID) return res.status(400).json({ error: 'unidadeID não informado!' })

        const sql = `
        SELECT parRecebimentoMpModeloID AS id, nome, ciclo, status
        FROM par_recebimentomp_modelo 
        WHERE unidadeID = ?
        ORDER BY nome ASC`
        const [result] = await db.promise().query(sql, [unidadeID])

        return res.json(result);
    }

    async getData(req, res) {
        const { id, unidadeID } = req.body;

        try {
            if (!id || id == 'undefined') { return res.json({ message: 'Sem ID recebido!' }) }

            //? Model
            const sql = `
            SELECT * 
            FROM par_recebimentomp_modelo
            WHERE parRecebimentoMpModeloID = ?`
            const [resultModel] = await db.promise().query(sql, [id])

            //? Header
            const sqlHeader = `
            SELECT pl.*, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM par_recebimentomp_modelo AS plm 
                    JOIN par_recebimentomp_modelo_cabecalho AS plmc ON (plm.parRecebimentoMpModeloID = plmc.parRecebimentoMpModeloID)
                WHERE plmc.parRecebimentoMpID = pl.parRecebimentoMpID AND plm.parRecebimentoMpModeloID = ?
                LIMIT 1
                ) AS mostra, 
                
                COALESCE((SELECT plmc.obrigatorio
                FROM par_recebimentomp_modelo AS plm 
                    JOIN par_recebimentomp_modelo_cabecalho AS plmc ON (plm.parRecebimentoMpModeloID = plmc.parRecebimentoMpModeloID)
                WHERE plmc.parRecebimentoMpID = pl.parRecebimentoMpID AND plm.parRecebimentoMpModeloID = ?
                LIMIT 1
                ), 0) AS obrigatorio

            FROM par_recebimentomp AS pl`;
            const [resultHeader] = await db.promise().query(sqlHeader, [id, id]);

            //? Blocks
            const blocks = [];
            const sqlBlock = `SELECT * FROM par_recebimentomp_modelo_bloco WHERE parRecebimentoMpModeloID = ? ORDER BY ordem ASC`;
            const [resultBlock] = await db.promise().query(sqlBlock, [id]);

            const sqlItem = `
            SELECT i.*, plmbi.*, a.nome AS alternativa, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM recebimentomp_resposta AS fr 
                WHERE fr.parRecebimentoMpModeloBlocoID = plmbi.parRecebimentoMpModeloBlocoID AND fr.itemID = plmbi.itemID) AS hasPending
            FROM par_recebimentomp_modelo_bloco_item AS plmbi 
                LEFT JOIN item AS i ON (plmbi.itemID = i.itemID)
                LEFT JOIN alternativa AS a ON (i.alternativaID = a.alternativaID)
            WHERE plmbi.parRecebimentoMpModeloBlocoID = ?
            ORDER BY plmbi.ordem ASC`

            //? Options
            const sqlOptionsItem = `SELECT itemID AS id, nome FROM item WHERE parFormularioID = 2 AND unidadeID = ? AND status = 1 ORDER BY nome ASC`;
            const [resultItem] = await db.promise().query(sqlOptionsItem, [unidadeID]);
            const objOptionsBlock = {
                itens: resultItem
            };

            for (const item of resultBlock) {
                const [resultItem] = await db.promise().query(sqlItem, [item.parRecebimentoMpModeloBlocoID])

                for (const item of resultItem) {
                    if (item) {
                        item['new'] = false
                        item['item'] = {
                            id: item.itemID,
                            nome: item.nome
                        }
                        item['alternativa'] = {
                            id: item.alternativaID,
                            nome: item.alternativa
                        }
                    }
                }

                const objData = {
                    dados: item,
                    itens: resultItem ?? [],
                    optionsBlock: objOptionsBlock
                };

                blocks.push(objData);
            }

            const sqlProfissionais = `
            SELECT profissionalID AS id, nome
            FROM profissional
            WHERE unidadeID = ? AND status = 1
            ORDER BY nome ASC`
            const [resultProfissionais] = await db.promise().query(sqlProfissionais, [unidadeID])

            //? Options
            const objOptions = {
                itens: resultItem ?? [],
                profissionais: resultProfissionais ?? []
            };

            //? Orientações
            const sqlOrientacoes = `SELECT obs FROM par_formulario WHERE parFormularioID = 2`;
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes)

            const result = {
                model: resultModel[0],
                header: resultHeader,
                blocks: blocks,
                options: objOptions,
                orientations: resultOrientacoes[0]
            }

            return res.json(result)
        } catch (error) {
            return res.json({ message: 'Erro ao receber dados!' })
        }
    }

    async updateData(req, res) {
        try {
            const { id, unidadeID, model, header, blocks, arrRemovedBlocks, arrRemovedItems, orientacoes } = req.body

            if (!id || id == 'undefined') { return res.json({ message: 'Erro ao receber ID!' }) }

            //? Model
            const sqlModel = `
            UPDATE par_recebimentomp_modelo
            SET nome = ?, ciclo = ?, status = ?
            WHERE parRecebimentoMpModeloID = ?`
            const [resultModel] = await db.promise().query(sqlModel, [model.nome, model.ciclo, (model.status ? 1 : 0), id])

            //? Header
            header && header.forEach(async (item) => {
                if (item && item.mostra) {
                    // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                    const sqlHeader = `
                    SELECT COUNT(*) AS count
                    FROM par_recebimentomp_modelo_cabecalho AS plmc
                    WHERE plmc.parRecebimentoMpModeloID = ? AND plmc.parRecebimentoMpID = ?`
                    // Verifica numero de linhas do sql 
                    const [resultHeader] = await db.promise().query(sqlHeader, [id, item.parRecebimentoMpID])
                    if (resultHeader[0].count === 0) { // Insert
                        const sqlInsert = `
                        INSERT INTO par_recebimentomp_modelo_cabecalho (parRecebimentoMpModeloID, parRecebimentoMpID, obrigatorio)
                        VALUES (?, ?, ?)`
                        const [resultInsert] = await db.promise().query(sqlInsert, [id, item.parRecebimentoMpID, (item.obrigatorio ? 1 : 0)]);
                    } else {                            // Update
                        const sqlUpdate = `
                        UPDATE par_recebimentomp_modelo_cabecalho
                        SET obrigatorio = ?
                        WHERE parRecebimentoMpModeloID = ? AND parRecebimentoMpID = ?`
                        const [resultUpdate] = await db.promise().query(sqlUpdate, [(item.obrigatorio ? 1 : 0), id, item.parRecebimentoMpID]);
                    }
                } else if (item) { // Deleta
                    const sqlDelete = `
                    DELETE FROM par_recebimentomp_modelo_cabecalho
                    WHERE parRecebimentoMpModeloID = ? AND parRecebimentoMpID = ?`
                    const [resultDelete] = await db.promise().query(sqlDelete, [id, item.parRecebimentoMpID])
                }
            })

            //? Blocos removidos
            arrRemovedBlocks && arrRemovedBlocks.forEach(async (block) => {
                if (block && block > 0) {
                    // Blocos
                    const sqlDeleteBlock = `DELETE FROM par_recebimentomp_modelo_bloco WHERE parRecebimentoMpModeloBlocoID = ?`
                    const [resultDeleteBlock] = await db.promise().query(sqlDeleteBlock, [block])

                    // Itens do bloco
                    const sqlDeleteBlockItems = `DELETE FROM par_recebimentomp_modelo_bloco_item WHERE parRecebimentoMpModeloBlocoID = ?`
                    const [resultDeleteBlockItems] = await db.promise().query(sqlDeleteBlockItems, [block])
                }
            })

            //? Itens removidos dos blocos 
            arrRemovedItems && arrRemovedItems.forEach(async (item) => {
                if (item) {
                    const sqlDelete = `DELETE FROM par_recebimentomp_modelo_bloco_item WHERE parRecebimentoMpModeloBlocoItemID = ?`
                    const [resultDelete] = await db.promise().query(sqlDelete, [item.parRecebimentoMpModeloBlocoItemID])
                }
            })

            //? Blocos 
            blocks && blocks.forEach(async (block, index) => {
                if (block) {
                    if (block.dados.parRecebimentoMpModeloBlocoID && parseInt(block.dados.parRecebimentoMpModeloBlocoID) > 0) {
                        //? Bloco já existe, Update
                        const sqlUpdateBlock = `
                        UPDATE par_recebimentomp_modelo_bloco
                        SET ordem = ?, nome = ?, obs = ?, status = ?
                        WHERE parRecebimentoMpModeloBlocoID = ?`
                        const [resultUpdateBlock] = await db.promise().query(sqlUpdateBlock, [
                            block.dados.ordem,
                            block.dados.nome,
                            (block.dados.obs ? 1 : 0),
                            (block.dados.status ? 1 : 0),
                            block.dados.parRecebimentoMpModeloBlocoID
                        ])
                        if (resultUpdateBlock.length === 0) { return res.json(err); }
                    } else {
                        //? Bloco novo, Insert
                        const sqlNewBlock = `
                        INSERT INTO par_recebimentomp_modelo_bloco(parRecebimentoMpModeloID, ordem, nome, obs, unidadeID, status) 
                        VALUES (?, ?, ?, ?, ?, ?)`
                        const [resultNewBlock] = await db.promise().query(sqlNewBlock, [
                            id,
                            block.dados.ordem,
                            block.dados.nome,
                            (block.dados.obs ? 1 : 0),
                            unidadeID,
                            (block.dados.status ? 1 : 0)
                        ])
                        if (resultNewBlock.length === 0) { return res.json(err); }
                        block.dados.parRecebimentoMpModeloBlocoID = resultNewBlock.insertId //? parRecebimentoMpModeloBlocoID que acabou de ser gerado
                    }

                    //? Itens 
                    block.itens && block.itens.forEach(async (item, indexItem) => {
                        if (item && item.parRecebimentoMpModeloBlocoItemID && item.parRecebimentoMpModeloBlocoItemID > 0) { //? Update                                
                            console.log('update item: ', item.item.id, item.item.nome)
                            const sqlUpdate = `
                            UPDATE par_recebimentomp_modelo_bloco_item
                            SET ordem = ?, ${item.item.id ? 'itemID = ?, ' : ''} obs = ?, obrigatorio = ?, status = ?
                            WHERE parRecebimentoMpModeloBlocoItemID = ?`
                            const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                item.ordem,
                                ...(item.item.id ? [item.item.id] : []),
                                (item.obs ? 1 : 0),
                                (item.obrigatorio ? 1 : 0),
                                (item.status ? 1 : 0),
                                item.parRecebimentoMpModeloBlocoItemID
                            ])
                        } else if (item && item.new && !item.parRecebimentoMpModeloBlocoItemID) { //? Insert                            
                            // Valida duplicidade do item 
                            const sqlItem = `
                            SELECT COUNT(*) AS count
                            FROM par_recebimentomp_modelo_bloco_item AS plmbi
                            WHERE plmbi.parRecebimentoMpModeloBlocoID = ? AND plmbi.itemID = ?`
                            const [resultItem] = await db.promise().query(sqlItem, [block.dados.parRecebimentoMpModeloBlocoID, item.item.id])
                            if (resultItem[0].count === 0) {  // Pode inserir
                                const sqlInsert = `
                                INSERT INTO par_recebimentomp_modelo_bloco_item (parRecebimentoMpModeloBlocoID, ordem, itemID, obs, obrigatorio, status)
                                VALUES (?, ?, ?, ?, ?, ?)`
                                const [resultInsert] = await db.promise().query(sqlInsert, [
                                    block.dados.parRecebimentoMpModeloBlocoID,
                                    item.ordem,
                                    item.item.id,
                                    (item.obs ? 1 : 0),
                                    (item.obrigatorio ? 1 : 0),
                                    (item.status ? 1 : 0)
                                ])
                            }
                        }
                    })
                }
            })

            //? Orientações
            const sqlOrientacoes = `
            UPDATE par_formulario
            SET obs = ? 
            WHERE parFormularioID = 2`
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes, [orientacoes?.obs])

            res.status(200).json({ message: "Dados atualizados com sucesso." });

        } catch (error) {
            return res.json({ message: 'Erro ao receber dados!' })
        }
    }
}

module.exports = RecebimentoMpController;