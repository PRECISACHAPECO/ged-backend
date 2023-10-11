const db = require('../../../../config/db');
const fs = require('fs');
const path = require('path');
require('dotenv/config')

class FornecedorController {
    async getList(req, res) {
        const { unidadeID } = req.params;

        if (!unidadeID) return res.status(400).json({ error: 'unidadeID não informado!' })

        const sql = `
        SELECT parFornecedorModeloID AS id, nome, ciclo, status
        FROM par_fornecedor_modelo 
        WHERE unidadeID = ?
        ORDER BY nome ASC`
        const [result] = await db.promise().query(sql, [unidadeID])

        return res.json(result);
    }

    async getData(req, res) {
        const { id } = req.params;
        const { unidadeID } = req.body;
        try {
            if (!id || id == 'undefined') { return res.json({ message: 'Sem ID recebido!' }) }

            //? Model
            const sql = `
            SELECT * 
            FROM par_fornecedor_modelo
            WHERE parFornecedorModeloID = ?`
            const [resultModel] = await db.promise().query(sql, [id])

            //? Header
            const sqlHeader = `
            SELECT pf.*, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM par_fornecedor_modelo AS pfm 
                    JOIN par_fornecedor_modelo_cabecalho AS pfmc ON (pfmc.parFornecedorID = pf.parFornecedorID AND pfm.parFornecedorModeloID = pfmc.parFornecedorModeloID)
                WHERE pfm.parFornecedorModeloID = ?
                LIMIT 1
                ) AS mostra, 
                
                COALESCE((SELECT pfmc.obrigatorio
                FROM par_fornecedor_modelo AS pfm 
                    JOIN par_fornecedor_modelo_cabecalho AS pfmc ON (pfmc.parFornecedorID = pf.parFornecedorID AND pfm.parFornecedorModeloID = pfmc.parFornecedorModeloID)
                WHERE pfm.parFornecedorModeloID = ?
                LIMIT 1
                ), 0) AS obrigatorio

            FROM par_fornecedor AS pf`;
            const [resultHeader] = await db.promise().query(sqlHeader, [id, id]);

            //? Blocks
            const blocks = [];
            const sqlBlock = `SELECT * FROM par_fornecedor_modelo_bloco WHERE parFornecedorModeloID = ? ORDER BY ordem ASC`;
            const [resultBlock] = await db.promise().query(sqlBlock, [id]);

            const sqlItem = `
            SELECT i.*, pfmbi.*, a.nome AS alternativa, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM fornecedor_resposta AS fr 
                WHERE fr.parFornecedorModeloBlocoID = pfmbi.parFornecedorModeloBlocoID AND fr.itemID = pfmbi.itemID) AS hasPending
            FROM par_fornecedor_modelo_bloco_item AS pfmbi 
                LEFT JOIN item AS i ON (pfmbi.itemID = i.itemID)
                LEFT JOIN alternativa AS a ON (i.alternativaID = a.alternativaID)
            WHERE pfmbi.parFornecedorModeloBlocoID = ?
            ORDER BY pfmbi.ordem ASC`

            //? Options
            const sqlOptionsItem = `SELECT itemID AS id, nome FROM item WHERE parFormularioID = 1 AND unidadeID = ? AND status = 1 ORDER BY nome ASC`;
            const [resultItem] = await db.promise().query(sqlOptionsItem, [unidadeID]);
            const objOptionsBlock = {
                itens: resultItem ?? [],
            };

            for (const item of resultBlock) {
                const [resultItem] = await db.promise().query(sqlItem, [item.parFornecedorModeloBlocoID])

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

            //? Options
            const objOptions = {
                itens: resultItem ?? [],
            };

            //? Orientações
            const sqlOrientacoes = `SELECT obs FROM par_formulario WHERE parFormularioID = 1`;
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes)

            const result = {
                model: resultModel[0],
                header: resultHeader,
                blocks: blocks,
                options: objOptions,
                orientations: resultOrientacoes[0]
            }
            console.log("🚀 ~ result:", result)

            return res.json(result)
        } catch (error) {
            return res.json({ message: 'Erro ao receber dados!' })
        }
    }

    async insertData(req, res) {
        try {
            const { unidadeID, model } = req.body
            console.log("🚀 ~ unidadeID, model:", unidadeID, model)

            if (!unidadeID || unidadeID == 'undefined') { return res.json({ message: 'Erro ao receber ID!' }) }

            //? Model
            const sqlModel = `INSERT INTO par_fornecedor_modelo(nome, ciclo, cabecalho, unidadeID, status) VALUES (?, ?, ?, ?, ?)`
            const [resultModel] = await db.promise().query(sqlModel, [model.nome, model.ciclo, model.cabecalho ?? '', unidadeID, (model.status ? 1 : 0)])
            const parFornecedorModeloID = resultModel.insertId

            return res.status(200).json({ id: parFornecedorModeloID });

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
            UPDATE par_fornecedor_modelo
            SET nome = ?, ciclo = ?, cabecalho = ?, status = ?
            WHERE parFornecedorModeloID = ?`
            const [resultModel] = await db.promise().query(sqlModel, [model?.nome, model?.ciclo, model?.cabecalho ?? '', (model?.status ? '1' : '0'), id])

            //? Header
            header && header.forEach(async (item) => {
                // if (item && (item.mostra || item.mostra == 1)) {
                console.log("🚀 ~ item:", item)
                // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                const sqlHeader = `
                    SELECT COUNT(*) AS count
                    FROM par_fornecedor_modelo_cabecalho AS plmc
                    WHERE plmc.parFornecedorModeloID = ? AND plmc.parFornecedorID = ?`
                // Verifica numero de linhas do sql 
                const [resultHeader] = await db.promise().query(sqlHeader, [id, item.parFornecedorID])
                if (resultHeader[0].count === 0) { // Insert
                    const sqlInsert = `
                        INSERT INTO par_fornecedor_modelo_cabecalho (parFornecedorModeloID, parFornecedorID, obrigatorio)
                        VALUES (?, ?, ?)`
                    const [resultInsert] = await db.promise().query(sqlInsert, [id, item.parFornecedorID, (item.obrigatorio ? '1' : '0')]);
                } else {                            // Update
                    const sqlUpdate = `
                        UPDATE par_fornecedor_modelo_cabecalho
                        SET obrigatorio = ?
                        WHERE parFornecedorModeloID = ? AND parFornecedorID = ?`
                    const [resultUpdate] = await db.promise().query(sqlUpdate, [(item.obrigatorio ? '1' : '0'), id, item.parFornecedorID]);
                }
                // } else if (item) { // Deleta
                //     const sqlDelete = `
                //     DELETE FROM par_fornecedor_modelo_cabecalho
                //     WHERE parFornecedorModeloID = ? AND parFornecedorID = ?`
                //     const [resultDelete] = await db.promise().query(sqlDelete, [id, item.parFornecedorID])
                // }
            })

            //? Blocos removidos
            arrRemovedBlocks && arrRemovedBlocks.forEach(async (block) => {
                if (block && block > 0) {
                    // Blocos
                    const sqlDeleteBlock = `DELETE FROM par_fornecedor_modelo_bloco WHERE parFornecedorModeloBlocoID = ?`
                    const [resultDeleteBlock] = await db.promise().query(sqlDeleteBlock, [block])

                    // Itens do bloco
                    const sqlDeleteBlockItems = `DELETE FROM par_fornecedor_modelo_bloco_item WHERE parFornecedorModeloBlocoID = ?`
                    const [resultDeleteBlockItems] = await db.promise().query(sqlDeleteBlockItems, [block])
                }
            })

            //? Itens removidos dos blocos 
            arrRemovedItems && arrRemovedItems.forEach(async (item) => {
                if (item) {
                    const sqlDelete = `DELETE FROM par_fornecedor_modelo_bloco_item WHERE parFornecedorModeloBlocoItemID = ?`
                    const [resultDelete] = await db.promise().query(sqlDelete, [item.parFornecedorModeloBlocoItemID])
                }
            })

            //? Blocos 
            blocks && blocks.forEach(async (block, index) => {
                if (block) {
                    if (block.dados.parFornecedorModeloBlocoID && parseInt(block.dados.parFornecedorModeloBlocoID) > 0) {
                        //? Bloco já existe, Update
                        const sqlUpdateBlock = `
                        UPDATE par_fornecedor_modelo_bloco
                        SET ordem = ?, nome = ?, obs = ?, status = ?
                        WHERE parFornecedorModeloBlocoID = ?`
                        const [resultUpdateBlock] = await db.promise().query(sqlUpdateBlock, [
                            block.dados.ordem,
                            block.dados.nome,
                            (block.dados.obs ? 1 : 0),
                            (block.dados.status ? 1 : 0),
                            block.dados.parFornecedorModeloBlocoID
                        ])
                        if (resultUpdateBlock.length === 0) { return res.json(err); }
                    } else {
                        //? Bloco novo, Insert
                        const sqlNewBlock = `
                        INSERT INTO par_fornecedor_modelo_bloco(parFornecedorModeloID, ordem, nome, obs, unidadeID, status) 
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
                        block.dados.parFornecedorModeloBlocoID = resultNewBlock.insertId //? parFornecedorModeloBlocoID que acabou de ser gerado
                    }

                    //? Itens 
                    block.itens && block.itens.forEach(async (item, indexItem) => {
                        if (item && item.parFornecedorModeloBlocoItemID && item.parFornecedorModeloBlocoItemID > 0) { //? Update                                
                            const sqlUpdate = `
                            UPDATE par_fornecedor_modelo_bloco_item
                            SET ordem = ?, ${item.item.id ? 'itemID = ?, ' : ''} obs = ?, obrigatorio = ?, status = ?
                            WHERE parFornecedorModeloBlocoItemID = ?`
                            const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                item.ordem,
                                ...(item.item.id ? [item.item.id] : []),
                                (item.obs ? 1 : 0),
                                (item.obrigatorio ? 1 : 0),
                                (item.status ? 1 : 0),
                                item.parFornecedorModeloBlocoItemID
                            ])
                        } else if (item && item.new && !item.parFornecedorModeloBlocoItemID) { //? Insert                            
                            // Valida duplicidade do item 
                            const sqlItem = `
                            SELECT COUNT(*) AS count
                            FROM par_fornecedor_modelo_bloco_item AS plmbi
                            WHERE plmbi.parFornecedorModeloBlocoID = ? AND plmbi.itemID = ?`
                            const [resultItem] = await db.promise().query(sqlItem, [block.dados.parFornecedorModeloBlocoID, item.item.id])
                            if (resultItem[0].count === 0) {  // Pode inserir
                                const sqlInsert = `
                                INSERT INTO par_fornecedor_modelo_bloco_item (parFornecedorModeloBlocoID, ordem, itemID, obs, obrigatorio, status)
                                VALUES (?, ?, ?, ?, ?, ?)`
                                const [resultInsert] = await db.promise().query(sqlInsert, [
                                    block.dados.parFornecedorModeloBlocoID,
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
            WHERE parFormularioID = 1`
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes, [orientacoes?.obs])

            res.status(200).json({ message: "Dados atualizados com sucesso." });

        } catch (error) {
            return res.json({ message: 'Erro ao receber dados!' })
        }
    }
}

module.exports = FornecedorController;