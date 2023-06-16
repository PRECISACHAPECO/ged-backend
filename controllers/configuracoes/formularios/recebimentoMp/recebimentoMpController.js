const db = require('../../../../config/db');
const { hasPending, deleteItem } = require('../../../../config/defaultConfig');

class RecebimentoMpController {
    async getData(req, res) {
        try {
            const { unidadeID } = req.body;

            if (!unidadeID || unidadeID == 'undefined') { return res.json({ message: 'Sem unidadeID recebida!' }) }

            //? Header 
            const sqlHeader = `
            SELECT pr.*, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM par_recebimentomp_unidade AS pru 
                WHERE pr.parRecebimentompID = pru.parRecebimentompID AND pru.unidadeID = ?
                LIMIT 1) AS mostra,
    
                COALESCE((SELECT pru.obrigatorio
                FROM par_recebimentomp_unidade AS pru 
                WHERE pr.parRecebimentompID = pru.parRecebimentompID AND pru.unidadeID = ?
                LIMIT 1), 0) AS obrigatorio            
                
            FROM par_recebimentomp AS pr
            ORDER BY pr.ordem ASC`;
            const resultHeader = await db.promise().query(sqlHeader, [unidadeID, unidadeID]);
            const header = resultHeader[0]

            //? Produtos
            const sqlProducts = `
            SELECT pr.*, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM par_recebimentomp_produto_unidade AS pru 
                WHERE pr.parRecebimentoMpProdutoID = pru.parRecebimentoMpProdutoID AND pru.unidadeID = ?
                LIMIT 1) AS mostra,
    
                COALESCE((SELECT pru.obrigatorio
                FROM par_recebimentomp_produto_unidade AS pru 
                WHERE pr.parRecebimentoMpProdutoID = pru.parRecebimentoMpProdutoID AND pru.unidadeID = ?
                LIMIT 1), 0) AS obrigatorio            
                
            FROM par_recebimentomp_produto AS pr
            ORDER BY pr.ordem ASC`;
            const resultProducts = await db.promise().query(sqlProducts, [unidadeID, unidadeID]);
            const products = resultProducts[0]

            //? Blocos 
            const blocks = [];
            const sqlBloco = `SELECT * FROM par_recebimentomp_bloco WHERE unidadeID = ? ORDER BY ordem ASC`;
            const [resultBloco] = await db.promise().query(sqlBloco, [unidadeID]);

            const sqlItem = `
            SELECT i.*, prbi.*, a.nome AS alternativa 
            FROM par_recebimentomp_bloco_item AS prbi 
                LEFT JOIN item AS i ON (prbi.itemID = i.itemID)
                LEFT JOIN alternativa AS a ON (prbi.alternativaID = a.alternativaID)
            WHERE prbi.parRecebimentompBlocoID = ?
            ORDER BY prbi.ordem ASC`

            for (const item of resultBloco) {
                const [resultItem] = await db.promise().query(sqlItem, [item.parRecebimentompBlocoID]);
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
                    itens: resultItem
                };

                blocks.push(objData);
            }

            //? Opções pra seleção
            const sqlOptionsItem = `SELECT itemID AS id, nome FROM item WHERE parFormularioID = 2 ORDER BY nome ASC`;
            const sqlOptionsAlternativa = `SELECT alternativaID AS id, nome FROM alternativa ORDER BY nome ASC`;
            const [resultItem] = await db.promise().query(sqlOptionsItem);
            const [resultAlternativa] = await db.promise().query(sqlOptionsAlternativa);
            const objOptions = {
                itens: resultItem,
                alternativas: resultAlternativa
            };

            //? Orientações
            const sqlOrientacoes = `SELECT obs FROM par_formulario WHERE parFormularioID = 2`
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes);

            const result = {
                header: header,
                products: products,
                blocks: blocks,
                orientacoes: resultOrientacoes[0],
                options: objOptions
            }

            return res.json(result)
        } catch (error) {
            return res.json({ message: 'Erro ao receber dados!' })
        }
    }

    async updateData(req, res) {
        try {
            const { unidadeID, header, products, blocks, orientacoes } = req.body

            //? Header
            header && header.forEach(async (item) => {
                if (item && item.mostra) {
                    // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                    const sqlHeader = `
                    SELECT COUNT(*) AS count
                    FROM par_recebimentomp_unidade AS pru
                    WHERE pru.parRecebimentompID = ? AND pru.unidadeID = ?`
                    const [resultHeader] = await db.promise().query(sqlHeader, [item.parRecebimentompID, unidadeID])
                    if (resultHeader[0].count === 0) { // Insert
                        const sqlInsert = `
                        INSERT INTO par_recebimentomp_unidade (parRecebimentompID, unidadeID, obrigatorio)
                        VALUES (?, ?, ?)`
                        const [resultInsert] = await db.promise().query(sqlInsert, [item.parRecebimentompID, unidadeID, (item.obrigatorio ? 1 : 0)])
                    } else {                        // Update
                        const sqlUpdate = `
                        UPDATE par_recebimentomp_unidade
                        SET obrigatorio = ?
                        WHERE parRecebimentompID = ? AND unidadeID = ?`
                        const [resultUpdate] = await db.promise().query(sqlUpdate, [(item.obrigatorio ? 1 : 0), item.parRecebimentompID, unidadeID])
                    }
                } else if (item) { // Deleta
                    const sqlDelete = `
                    DELETE FROM par_recebimentomp_unidade
                    WHERE parRecebimentompID = ? AND unidadeID = ?`
                    const [resultDelete] = await db.promise().query(sqlDelete, [item.parRecebimentompID, unidadeID])
                }
            })

            //? Products
            products && products.forEach(async (item) => {
                if (item && item.mostra) {
                    // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                    const sqlProduct = `
                    SELECT COUNT(*) AS count
                    FROM par_recebimentomp_produto_unidade AS pru
                    WHERE pru.parRecebimentoMpProdutoID = ? AND pru.unidadeID = ?`
                    // Verifica numero de linhas do sql 
                    const [resultProduct] = await db.promise().query(sqlProduct, [item.parRecebimentoMpProdutoID, unidadeID])
                    if (resultProduct[0].count === 0) { // Insert
                        const sqlInsert = `
                        INSERT INTO par_recebimentomp_produto_unidade (parRecebimentoMpProdutoID, unidadeID, obrigatorio)
                        VALUES (?, ?, ?)`
                        const [resultInsert] = await db.promise().query(sqlInsert, [item.parRecebimentoMpProdutoID, unidadeID, (item.obrigatorio ? 1 : 0)])
                    } else {                         // Update
                        const sqlUpdate = `
                        UPDATE par_recebimentomp_produto_unidade
                        SET obrigatorio = ?
                        WHERE parRecebimentoMpProdutoID = ? AND unidadeID = ?`
                        const [resultUpdate] = await db.promise().query(sqlUpdate, [(item.obrigatorio ? 1 : 0), item.parRecebimentoMpProdutoID, unidadeID])
                    }
                } else if (item) {                  // Delete
                    const sqlDelete = `
                    DELETE FROM par_recebimentomp_produto_unidade
                    WHERE parRecebimentoMpProdutoID = ? AND unidadeID = ?`
                    const [resultDelete] = await db.promise().query(sqlDelete, [item.parRecebimentoMpProdutoID, unidadeID])
                }
            })

            //? Blocos 
            blocks && blocks.forEach(async (block, index) => {
                if (block) {
                    if (block.parRecebimentompBlocoID && block.parRecebimentompBlocoID > 0) { // Update
                        const sqlUpdateBlock = `
                        UPDATE par_recebimentomp_bloco
                        SET ordem = ?, nome = ?, obs = ?, status = ?
                        WHERE parRecebimentompBlocoID = ?`
                        const [resultUpdateBlock] = await db.promise().query(sqlUpdateBlock, [block.sequencia, block.nome, (block.obs ? 1 : 0), (block.status ? 1 : 0), block.parRecebimentompBlocoID])
                    } else {                                                                 // Insert
                        const sqlInsertBlock = `INSERT INTO par_recebimentomp_bloco (ordem, nome, obs, unidadeID, status) VALUES (?, ?, ?, ?, ?)`
                        const [resultInsertBlock] = await db.promise().query(sqlInsertBlock, [
                            block.sequencia,
                            block.nome,
                            (block.obs ? 1 : 0),
                            unidadeID,
                            (block.status ? 1 : 0)
                        ])
                        block.parRecebimentompBlocoID = resultInsertBlock.insertId
                    }

                    //? Itens 
                    block.itens && block.itens.forEach(async (item, indexItem) => {
                        if (item && item.parRecebimentompBlocoItemID) {
                            // Update
                            const sqlUpdate = `
                            UPDATE par_recebimentomp_bloco_item
                            SET ordem = ?, ${item.item.id ? 'itemID = ?, ' : ''} ${item.alternativaID ? 'alternativaID = ?, ' : ''} obs = ?, obrigatorio = ?, status = ?
                            WHERE parRecebimentompBlocoItemID = ?`
                            const [resultUpdate] = await db.promise().query(sqlUpdate, [
                                item.sequencia,
                                ...(item.item.id ? [item.item.id] : []),
                                ...(item.alternativaID ? [item.alternativaID] : []),
                                (item.obs ? 1 : 0),
                                (item.obrigatorio ? 1 : 0),
                                (item.status ? 1 : 0),
                                item.parRecebimentompBlocoItemID
                            ])
                        } else if (item && block.parRecebimentompBlocoID && item.sequencia && item.item.id && item.alternativa.id) {
                            // Insert
                            const sqlInsert = `
                            INSERT INTO par_recebimentomp_bloco_item (parRecebimentompBlocoID, ordem, itemID, alternativaID, obs, obrigatorio, status)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`
                            const [resultInsert] = await db.promise().query(sqlInsert, [
                                block.parRecebimentompBlocoID,
                                item.sequencia,
                                item.item.id,
                                item.alternativa.id,
                                (item.obs ? 1 : 0),
                                (item.obrigatorio ? 1 : 0),
                                (item.status ? 1 : 0)
                            ])
                        }

                    })
                }
            })

            //? Orientações
            const sqlOrientacoes = `
            UPDATE par_formulario
            SET obs = ? 
            WHERE parFormularioID = 2`
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes, [orientacoes])

            res.status(200).json({ message: "Dados atualizados com sucesso." });

        } catch (error) {
            return res.json({ message: 'Erro' })
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
                    res.status(409).json({ message: "Dado possui pendência." });
                } else {
                    return deleteItem(id, objModule.table, objModule.column, res)
                }
            })
            .catch((err) => {
                res.status(500).json(err);
            });
    }

}

module.exports = RecebimentoMpController;