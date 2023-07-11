const db = require('../../../../config/db');
const { hasPending, deleteItem } = require('../../../../config/defaultConfig');

class FornecedorController {

    async getData(req, res) {
        const { unidadeID } = req.body;
        try {
            if (!unidadeID || unidadeID == 'undefined') { return res.json({ message: 'Sem unidadeID recebida!' }) }

            //? Header
            const sqlHeader = `
            SELECT pf.*, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM par_fornecedor_unidade AS pfu 
                WHERE pf.parFornecedorID = pfu.parFornecedorID AND pfu.unidadeID = ?
                LIMIT 1) AS mostra,
                
                COALESCE((SELECT pfu.obrigatorio
                FROM par_fornecedor_unidade AS pfu 
                WHERE pf.parFornecedorID = pfu.parFornecedorID AND pfu.unidadeID = ?
                LIMIT 1), 0) AS obrigatorio            
            FROM par_fornecedor AS pf 
            ORDER BY pf.ordem ASC`;
            const [resultHeader] = await db.promise().query(sqlHeader, [unidadeID, unidadeID]);

            //? Blocks
            const blocks = [];
            const sqlBlock = `SELECT * FROM par_fornecedor_bloco WHERE unidadeID = ? ORDER BY ordem ASC`;
            const [resultBlock] = await db.promise().query(sqlBlock, [unidadeID]);

            const sqlItem = `
            SELECT i.*, pfbi.*, a.nome AS alternativa, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM fornecedor_resposta AS fr 
                WHERE fr.parFornecedorBlocoID = pfbi.parFornecedorBlocoID AND fr.itemID = pfbi.itemID) AS hasPending
            FROM par_fornecedor_bloco_item AS pfbi 
                LEFT JOIN item AS i ON (pfbi.itemID = i.itemID)
                LEFT JOIN alternativa AS a ON (pfbi.alternativaID = a.alternativaID)
            WHERE pfbi.parFornecedorBlocoID = ?
            ORDER BY pfbi.ordem ASC`

            //? Options
            const sqlAllCategories = `SELECT c.categoriaID AS id, c.nome FROM categoria AS c ORDER BY c.nome ASC`;
            const sqlAllActivities = `SELECT a.atividadeID AS id, a.nome FROM atividade AS a ORDER BY a.nome ASC`;
            const sqlOptionsItem = `SELECT itemID AS id, nome FROM item WHERE parFormularioID = 1 AND status = 1 ORDER BY nome ASC`;
            const sqlOptionsAlternativa = `SELECT alternativaID AS id, nome FROM alternativa ORDER BY nome ASC`;
            const [resultAllCategories] = await db.promise().query(sqlAllCategories);
            const [resultAllActivities] = await db.promise().query(sqlAllActivities);
            const [resultItem] = await db.promise().query(sqlOptionsItem);
            const [resultAlternativa] = await db.promise().query(sqlOptionsAlternativa);
            const objOptionsBlock = {
                itens: resultItem,
                alternativas: resultAlternativa
            };

            for (const item of resultBlock) {
                const sqlBlockCategories = `
                SELECT pfbc.categoriaID AS id, c.nome
                FROM par_fornecedor_bloco_categoria AS pfbc
                    JOIN categoria AS c ON (pfbc.categoriaID = c.categoriaID)
                WHERE pfbc.parFornecedorBlocoID = ? AND pfbc.unidadeID = ?
                ORDER BY c.nome ASC`;

                const sqlBlockActivities = `
                SELECT pfba.atividadeID AS id, a.nome
                FROM par_fornecedor_bloco_atividade AS pfba 
                    JOIN atividade AS a ON (pfba.atividadeID = a.atividadeID)
                WHERE pfba.parFornecedorBlocoID = ? AND pfba.unidadeID = ?
                ORDER BY a.nome ASC`;

                const [resultCategoria] = await db.promise().query(sqlBlockCategories, [item.parFornecedorBlocoID, unidadeID]);
                const [resultAtividade] = await db.promise().query(sqlBlockActivities, [item.parFornecedorBlocoID, unidadeID]);
                const [resultItem] = await db.promise().query(sqlItem, [item.parFornecedorBlocoID]);

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
                    categorias: resultCategoria ? resultCategoria : [],
                    atividades: resultAtividade ? resultAtividade : [],
                    itens: resultItem,
                    optionsBlock: objOptionsBlock
                };

                blocks.push(objData);
            }

            //? Options
            const objOptions = {
                categorias: resultAllCategories,
                atividades: resultAllActivities,
                itens: resultItem,
                alternativas: resultAlternativa
            };

            //? Orientações
            const sqlOrientacoes = `SELECT obs FROM par_formulario WHERE parFormularioID = 1`;
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes)

            const result = {
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
            const { unidadeID, header, blocks, arrRemovedItems, orientacoes } = req.body

            if (!unidadeID || unidadeID == 'undefined') { return res.json({ message: 'Erro ao receber unidadeID!' }) }

            //? Header
            header && header.forEach(async (item) => {
                if (item && item.mostra) {
                    // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                    const sqlHeader = `
                    SELECT COUNT(*) AS count
                    FROM par_fornecedor_unidade AS pfu
                    WHERE pfu.parFornecedorID = ? AND pfu.unidadeID = ?`
                    // Verifica numero de linhas do sql 
                    const [resultHeader] = await db.promise().query(sqlHeader, [item.parFornecedorID, unidadeID])
                    if (resultHeader[0].count === 0) { // Insert
                        const sqlInsert = `
                        INSERT INTO par_fornecedor_unidade (parFornecedorID, unidadeID, obrigatorio)
                        VALUES (?, ?, ?)`
                        const [resultInsert] = await db.promise().query(sqlInsert, [item.parFornecedorID, unidadeID, (item.obrigatorio ? 1 : 0)]);
                    } else {                            // Update
                        const sqlUpdate = `
                        UPDATE par_fornecedor_unidade
                        SET obrigatorio = ?
                        WHERE parFornecedorID = ? AND unidadeID = ?`
                        const [resultUpdate] = await db.promise().query(sqlUpdate, [(item.obrigatorio ? 1 : 0), item.parFornecedorID, unidadeID]);
                    }
                } else if (item) { // Deleta
                    const sqlDelete = `
                    DELETE FROM par_fornecedor_unidade
                    WHERE parFornecedorID = ? AND unidadeID = ?`
                    const [resultDelete] = await db.promise().query(sqlDelete, [item.parFornecedorID, unidadeID])
                }
            })

            //? Itens removidos dos blocos 
            arrRemovedItems && arrRemovedItems.forEach(async (item) => {
                if (item) {
                    const sqlDelete = `DELETE FROM par_fornecedor_bloco_item WHERE parFornecedorBlocoItemID = ?`
                    const [resultDelete] = await db.promise().query(sqlDelete, [item.parFornecedorBlocoItemID])
                }
            })

            //? Blocos 
            blocks && blocks.forEach(async (block, index) => {
                if (block) {
                    if (block.dados.parFornecedorBlocoID && parseInt(block.dados.parFornecedorBlocoID) > 0) {
                        //? Bloco já existe, Update
                        const sqlUpdateBlock = `
                        UPDATE par_fornecedor_bloco
                        SET ordem = ?, nome = ?, obs = ?, status = ?
                        WHERE parFornecedorBlocoID = ?`
                        const [resultUpdateBlock] = await db.promise().query(sqlUpdateBlock, [
                            block.dados.ordem,
                            block.dados.nome,
                            (block.dados.obs ? 1 : 0),
                            (block.dados.status ? 1 : 0),
                            block.dados.parFornecedorBlocoID
                        ])
                        if (resultUpdateBlock.length === 0) { return res.json(err); }
                    } else {
                        //? Bloco novo, Insert
                        const sqlNewBlock = `
                        INSERT INTO par_fornecedor_bloco(ordem, nome, obs, unidadeID, status) 
                        VALUES (?, ?, ?, ?, ?)`
                        const [resultNewBlock] = await db.promise().query(sqlNewBlock, [
                            block.dados.ordem,
                            block.dados.nome,
                            (block.dados.obs ? 1 : 0),
                            unidadeID,
                            (block.dados.status ? 1 : 0)
                        ])
                        if (resultNewBlock.length === 0) { return res.json(err); }
                        block.parFornecedorBlocoID = resultNewBlock.insertId //? parFornecedorBlocoID que acabou de ser gerado
                    }

                    //? Categoria (Fabricante / Importador)
                    // Remove atuais
                    const sqlDeleteCategoria = `DELETE FROM par_fornecedor_bloco_categoria WHERE parFornecedorBlocoID = ? AND unidadeID = ?`
                    const [resultDeleteCategoria] = await db.promise().query(sqlDeleteCategoria, [block.dados.parFornecedorBlocoID, unidadeID])
                    // Insere novamente
                    block.categorias && block.categorias.forEach(async (categoria, indexCategoria) => {
                        if (categoria) {
                            const sqlInsertCategoria = `
                            INSERT INTO par_fornecedor_bloco_categoria (parFornecedorBlocoID, categoriaID, unidadeID)
                            VALUES (?, ?, ?)`
                            const [resultInsertCategoria] = await db.promise().query(sqlInsertCategoria, [block.dados.parFornecedorBlocoID, categoria.id, unidadeID]);
                        }
                    })

                    //? Atividades
                    // Remove as atuais
                    const sqlDeleteAtividade = `DELETE FROM par_fornecedor_bloco_atividade WHERE parFornecedorBlocoID = ? AND unidadeID = ?`
                    const [resultDeleteAtividade] = await db.promise().query(sqlDeleteAtividade, [block.dados.parFornecedorBlocoID, unidadeID])
                    // Insere novamente
                    block.atividades && block.atividades.forEach(async (atividade, indexAtividade) => {
                        if (atividade) {
                            const sqlInsertAtividade = `
                            INSERT INTO par_fornecedor_bloco_atividade (parFornecedorBlocoID, atividadeID, unidadeID)
                            VALUES (?, ?, ?)`
                            const [resultInsertAtividade] = await db.promise().query(sqlInsertAtividade, [block.dados.parFornecedorBlocoID, atividade.id, unidadeID]);
                        }
                    })

                    //? Itens 
                    block.itens && block.itens.forEach(async (item, indexItem) => {
                        if (item && item.parFornecedorBlocoItemID && item.parFornecedorBlocoItemID > 0) { //? Update                                
                            console.log('update item: ', item.item.id, item.item.nome)
                            const sqlUpdate = `
                            UPDATE par_fornecedor_bloco_item
                            SET ordem = ?, ${item.item.id ? 'itemID = ?, ' : ''} ${item.alternativa.id ? 'alternativaID = ?, ' : ''} obs = ?, obrigatorio = ?, status = ?
                            WHERE parFornecedorBlocoItemID = ?`
                            const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                item.ordem,
                                ...(item.item.id ? [item.item.id] : []),
                                ...(item.alternativa.id ? [item.alternativa.id] : []),
                                (item.obs ? 1 : 0),
                                (item.obrigatorio ? 1 : 0),
                                (item.status ? 1 : 0),
                                item.parFornecedorBlocoItemID
                            ])
                        } else if (item && item.new && !item.parFornecedorBlocoItemID) { //? Insert                            
                            console.log('insert new item: ', item.item.id, item.item.nome)
                            // Valida duplicidade do item 
                            const sqlItem = `
                            SELECT COUNT(*) AS count
                            FROM par_fornecedor_bloco_item AS pfbi
                            WHERE pfbi.parFornecedorBlocoID = ? AND pfbi.itemID = ? AND pfbi.alternativaID = ?`
                            const [resultItem] = await db.promise().query(sqlItem, [block.dados.parFornecedorBlocoID, item.item.id, item.alternativa.id])
                            if (resultItem[0].count === 0) {  // Pode inserir
                                const sqlInsert = `
                                INSERT INTO par_fornecedor_bloco_item (parFornecedorBlocoID, ordem, itemID, alternativaID, obs, obrigatorio, status)
                                VALUES (?, ?, ?, ?, ?, ?, ?)`
                                const [resultInsert] = await db.promise().query(sqlInsert, [
                                    block.dados.parFornecedorBlocoID,
                                    item.ordem,
                                    item.item.id,
                                    item.alternativa.id,
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
                    return res.status(409).json({ message: "Dado possui pendência." });
                } else {
                    return deleteItem(id, objModule.table, objModule.column, res)
                }
            })
            .catch((err) => {
                return res.status(500).json(err);
            });
    }

}

module.exports = FornecedorController;