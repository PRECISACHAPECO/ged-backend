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

            const sqlCategoria = `
            SELECT c.*, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM par_fornecedor_bloco_categoria AS pfbc
                WHERE pfbc.categoriaID = c.categoriaID AND pfbc.parFornecedorBlocoID = ? AND pfbc.unidadeID = ?) AS checked
            FROM categoria AS c
            ORDER BY c.nome ASC`;

            const sqlAtividade = `
            SELECT a.*, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM par_fornecedor_bloco_atividade AS pfba 
                WHERE pfba.atividadeID = a.atividadeID AND pfba.parFornecedorBlocoID = ? AND pfba.unidadeID = ?) AS checked
            FROM atividade AS a 
            ORDER BY a.nome ASC`;

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
            const sqlOptionsItem = `SELECT itemID AS id, nome FROM item WHERE parFormularioID = 1 AND status = 1 ORDER BY nome ASC`;
            const sqlOptionsAlternativa = `SELECT alternativaID AS id, nome FROM alternativa ORDER BY nome ASC`;
            const [resultItem] = await db.promise().query(sqlOptionsItem);
            const [resultAlternativa] = await db.promise().query(sqlOptionsAlternativa);
            const objOptionsBlock = {
                itens: resultItem,
                alternativas: resultAlternativa
            };

            for (const item of resultBlock) {
                const [resultCategoria] = await db.promise().query(sqlCategoria, [item.parFornecedorBlocoID, unidadeID]);
                const [resultAtividade] = await db.promise().query(sqlAtividade, [item.parFornecedorBlocoID, unidadeID]);
                const [resultItem] = await db.promise().query(sqlItem, [item.parFornecedorBlocoID]);

                for (const item of resultItem) {
                    if (item) {
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
                    atividades: resultAtividade ? resultAtividade : [],
                    categorias: resultCategoria ? resultCategoria : [],
                    itens: resultItem,
                    optionsBlock: objOptionsBlock
                };

                blocks.push(objData);
            }

            //? Options
            // const sqlOptionsItem = `SELECT itemID AS id, nome FROM item WHERE parFormularioID = 1 AND status = 1 ORDER BY nome ASC`;
            // const sqlOptionsAlternativa = `SELECT alternativaID AS id, nome FROM alternativa ORDER BY nome ASC`;
            // const [resultItem] = await db.promise().query(sqlOptionsItem);
            // const [resultAlternativa] = await db.promise().query(sqlOptionsAlternativa);
            const objOptions = {
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
                    if (block.parFornecedorBlocoID && parseInt(block.parFornecedorBlocoID) > 0) {
                        //? Bloco já existe, Update
                        const sqlUpdateBlock = `
                        UPDATE par_fornecedor_bloco
                        SET ordem = ?, nome = ?, obs = ?, status = ?
                        WHERE parFornecedorBlocoID = ?`
                        const [resultUpdateBlock] = await db.promise().query(sqlUpdateBlock, [
                            block.sequencia,
                            block.nome,
                            (block.obs ? 1 : 0),
                            (block.status ? 1 : 0),
                            block.parFornecedorBlocoID
                        ])
                        if (resultUpdateBlock.length === 0) { return res.json(err); }
                    } else {
                        //? Bloco novo, Insert
                        const sqlNewBlock = `
                        INSERT INTO par_fornecedor_bloco(ordem, nome, obs, unidadeID, status) 
                        VALUES (?, ?, ?, ?, ?)`
                        const [resultNewBlock] = await db.promise().query(sqlNewBlock, [
                            block.sequencia,
                            block.nome,
                            (block.obs ? 1 : 0),
                            unidadeID,
                            (block.status ? 1 : 0)
                        ])
                        if (resultNewBlock.length === 0) { return res.json(err); }
                        block.parFornecedorBlocoID = resultNewBlock.insertId //? parFornecedorBlocoID que acabou de ser gerado
                    }

                    //? Categoria (Fabricante / Importador)
                    block.categorias && block.categorias.forEach(async (categoria, indexCategoria) => {
                        if (categoria) {
                            if (categoria.checked) {
                                // Verifica se já existe registro em "par_fornecedor_bloco_categoria" para o fornecedor e unidade
                                const sqlCategoria = `
                                SELECT COUNT(*) AS count
                                FROM par_fornecedor_bloco_categoria AS pfbc
                                WHERE pfbc.parFornecedorBlocoID = ? AND pfbc.categoriaID = ? AND pfbc.unidadeID = ?`
                                // Verifica numero de linhas do sql
                                const [resultCategoria] = await db.promise().query(sqlCategoria, [block.parFornecedorBlocoID, categoria.categoriaID, unidadeID])
                                if (resultCategoria[0].count == 0) { // Insert 
                                    const sqlInsertCategoria = `
                                    INSERT INTO par_fornecedor_bloco_categoria (parFornecedorBlocoID, categoriaID, unidadeID)
                                    VALUES (?, ?, ?)`
                                    const [resultInsertCategoria] = await db.promise().query(sqlInsertCategoria, [block.parFornecedorBlocoID, categoria.categoriaID, unidadeID]);
                                }
                            }
                        } else { // Deleta
                            const sqlDeleteCategoria = `
                            DELETE FROM par_fornecedor_bloco_categoria
                            WHERE parFornecedorBlocoID = ? AND categoriaID = ? AND unidadeID = ?`
                            const [resultDeleteCategoria] = await db.promise().query(sqlDeleteCategoria, [block.parFornecedorBlocoID, categoria.categoriaID, unidadeID])
                        }
                    })

                    //? Atividades
                    block.atividades && block.atividades.forEach(async (atividade, indexAtividade) => {
                        if (atividade) {
                            if (atividade.checked) {
                                // Verifica se já existe registro em "par_fornecedor_bloco_atividade" para o fornecedor e unidade
                                const sqlAtividade = `
                                SELECT COUNT(*) AS count
                                FROM par_fornecedor_bloco_atividade AS pfba
                                WHERE pfba.parFornecedorBlocoID = ? AND pfba.atividadeID = ? AND pfba.unidadeID = ?`
                                // Verifica numero de linhas do sql
                                const [resultAtividade] = await db.promise().query(sqlAtividade, [block.parFornecedorBlocoID, atividade.atividadeID, unidadeID])
                                if (resultAtividade[0].count == 0) { // Insert 
                                    const sqlInsertAtividade = `
                                    INSERT INTO par_fornecedor_bloco_atividade (parFornecedorBlocoID, atividadeID, unidadeID)
                                    VALUES (?, ?, ?)`
                                    const [resultInsertAtividade] = await db.promise().query(sqlInsertAtividade, [block.parFornecedorBlocoID, atividade.atividadeID, unidadeID]);
                                }
                            } else { // Deleta
                                const sqlDeleteAtividade = `
                                DELETE FROM par_fornecedor_bloco_atividade
                                WHERE parFornecedorBlocoID = ? AND atividadeID = ? AND unidadeID = ?`
                                const [resultDeleteAtividade] = await db.promise().query(sqlDeleteAtividade, [block.parFornecedorBlocoID, atividade.atividadeID, unidadeID])
                            }
                        }
                    })

                    //? Itens 
                    block.itens && block.itens.forEach(async (item, indexItem) => {
                        if (item && item.parFornecedorBlocoItemID && item.parFornecedorBlocoItemID > 0) { //? Update                                
                            console.log('update item: ', item.item.id)
                            const sqlUpdate = `
                            UPDATE par_fornecedor_bloco_item
                            SET ordem = ?, ${item.item.id ? 'itemID = ?, ' : ''} ${item.alternativa.id ? 'alternativaID = ?, ' : ''} obs = ?, obrigatorio = ?, status = ?
                            WHERE parFornecedorBlocoItemID = ?`
                            const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                item.sequencia,
                                ...(item.item.id ? [item.item.id] : []),
                                ...(item.alternativa.id ? [item.alternativa.id] : []),
                                (item.obs ? 1 : 0),
                                (item.obrigatorio ? 1 : 0),
                                (item.status ? 1 : 0),
                                item.parFornecedorBlocoItemID
                            ])
                        } else if (item && item.new /*&& !item.parFornecedorBlocoItemID*/) { //? Insert                            
                            console.log('insert new item: ', item.item.id)
                            // Valida duplicidade do item 
                            const sqlItem = `
                            SELECT COUNT(*) AS count
                            FROM par_fornecedor_bloco_item AS pfbi
                            WHERE pfbi.parFornecedorBlocoID = ? AND pfbi.itemID = ? AND pfbi.alternativaID = ?`
                            const [resultItem] = await db.promise().query(sqlItem, [block.parFornecedorBlocoID, item.item.id, item.alternativa.id])
                            if (resultItem[0].count === 0) {  // Pode inserir
                                const sqlInsert = `
                                INSERT INTO par_fornecedor_bloco_item (parFornecedorBlocoID, ordem, itemID, alternativaID, obs, obrigatorio, status)
                                VALUES (?, ?, ?, ?, ?, ?, ?)`
                                const [resultInsert] = await db.promise().query(sqlInsert, [
                                    block.parFornecedorBlocoID,
                                    item.sequencia,
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
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes, [orientacoes])

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