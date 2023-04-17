const db = require('../../../../config/db');
const { hasPending, deleteItem } = require('../../../../config/defaultConfig');

class RecebimentoMpController {

    async getData(req, res) {
        const functionName = req.headers['function-name'];
        const unidadeID = req.params.id;

        switch (functionName) {
            // Obtém cabeçalho do formulário
            case 'getHeader':
                const sqlHeader = `
                SELECT pr.*, 
                    (SELECT IF(COUNT(*) > 0, 1, 0)
                    FROM par_recebimentomp_unidade AS pru 
                    WHERE pr.parRecebimentoMpID = pru.parRecebimentoMpID AND pru.unidadeID = ?
                    LIMIT 1) AS mostra,

                    COALESCE((SELECT pru.obrigatorio
                    FROM par_recebimentomp_unidade AS pru 
                    WHERE pr.parRecebimentoMpID = pru.parRecebimentoMpID AND pru.unidadeID = ?
                    LIMIT 1), 0) AS obrigatorio            
                    
                FROM par_recebimentomp AS pr
                ORDER BY pr.ordem ASC;`;

                try {
                    const resultHeader = await db.promise().query(sqlHeader, [unidadeID, unidadeID]);
                    res.status(200).json(resultHeader[0]);
                } catch (err) {
                    res.status(500).json(err);
                }
                break;

            // Obtém os produtos
            case 'getProducts':
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
                ORDER BY pr.ordem ASC;`;

                try {
                    const resultProducts = await db.promise().query(sqlProducts, [unidadeID, unidadeID]);
                    res.status(200).json(resultProducts[0]);
                } catch (err) {
                    res.status(500).json(err);
                }
                break;

            // Obtem as opções pra seleção da listagem dos selects de itens e alternativas
            case 'getOptionsItens':
                const sqlItem = `SELECT * FROM item WHERE parFormularioID = 2 ORDER BY nome ASC;`;
                const sqlAlternativa = `SELECT alternativaID, nome AS alternativa FROM alternativa ORDER BY nome ASC;`;
                // Montar objeto com os resultados das queries
                try {
                    const resultItem = await db.promise().query(sqlItem);
                    const resultAlternativa = await db.promise().query(sqlAlternativa);
                    const objData = {
                        itens: resultItem[0],
                        alternativas: resultAlternativa[0]
                    };
                    res.status(200).json(objData);
                } catch (err) {
                    res.status(500).json(err);
                }
                break;

            // Obtém blocos do formulário
            case 'getBlocks':
                try {
                    const blocks = [];
                    const sqlBloco = `SELECT * FROM par_recebimentomp_bloco WHERE unidadeID = ? ORDER BY ordem ASC`;
                    const [resultBloco] = await db.promise().query(sqlBloco, [unidadeID]);

                    const sqlItem = `
                    SELECT prbi.*, i.*, a.nome AS alternativa 
                    FROM par_recebimentomp_bloco_item AS prbi 
                        LEFT JOIN item AS i ON (prbi.itemID = i.itemID)
                        LEFT JOIN alternativa AS a ON (prbi.alternativaID = a.alternativaID)
                    WHERE prbi.parRecebimentoMpBlocoID = ?
                    ORDER BY prbi.ordem ASC`

                    // Varre bloco
                    for (const item of resultBloco) {
                        // const [resultAtividade] = await db.promise().query(sqlAtividade, [item.parFornecedorBlocoID, unidadeID]);
                        const [resultItem] = await db.promise().query(sqlItem, [item.parRecebimentoMpBlocoID]);

                        const objData = {
                            dados: item,
                            itens: resultItem
                        };

                        blocks.push(objData);
                    }

                    res.status(200).json(blocks);
                } catch (err) {
                    res.status(500).json(err);
                }
                break;

            case 'getOrientacoes':
                // Obtem orientacoes da tabela par_formulario e retorna 
                const sqlOrientacoes = `SELECT obs FROM par_formulario WHERE parFormularioID = 1`;
                const [resultOrientacoes] = await db.promise().query(sqlOrientacoes)
                res.status(200).json(resultOrientacoes[0]);

                break;

        }
    }

    updateData(req, res) {
        const unidadeID = req.params.id;
        const { header, products, blocks, orientacoes } = req.body

        // Header
        header && header.forEach((item) => {
            if (item) {
                if (item.mostra) {
                    // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                    const sql = `
                    SELECT COUNT(*) AS count
                    FROM par_recebimentomp_unidade AS pru
                    WHERE pru.parRecebimentoMpID = ? AND pru.unidadeID = ?`
                    // Verifica numero de linhas do sql 
                    db.query(sql, [item.parRecebimentoMpID, unidadeID], (err, result) => {
                        if (err) { res.status(500).json(err); }
                        if (result[0].count == 0) { // Insert 
                            const sql = `
                            INSERT INTO par_recebimentomp_unidade (parRecebimentoMpID, unidadeID, obrigatorio)
                            VALUES (?, ?, ?)`
                            db.query(sql, [item.parRecebimentoMpID, unidadeID, (item.obrigatorio ? 1 : 0)], (err, result) => {
                                if (err) { res.status(500).json(err); }
                            });
                        } else { // Update obrigatorio
                            const sql = `
                            UPDATE par_recebimentomp_unidade
                            SET obrigatorio = ?
                            WHERE parRecebimentoMpID = ? AND unidadeID = ?`
                            db.query(sql, [(item.obrigatorio ? 1 : 0), item.parRecebimentoMpID, unidadeID], (err, result) => {
                                if (err) { res.status(500).json(err); }
                            });
                        }
                    })
                } else { // Deleta
                    const sql = `
                    DELETE FROM par_recebimentomp_unidade
                    WHERE parRecebimentoMpID = ? AND unidadeID = ?;`

                    db.query(sql, [item.parRecebimentoMpID, unidadeID], (err, result) => {
                        if (err) { res.status(500).json(err); }
                    })
                }
            }
        })

        // Products
        products && products.forEach((item) => {
            if (item) {
                if (item.mostra) {
                    // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                    const sql = `
                    SELECT COUNT(*) AS count
                    FROM par_recebimentomp_produto_unidade AS pru
                    WHERE pru.parRecebimentoMpProdutoID = ? AND pru.unidadeID = ?`
                    // Verifica numero de linhas do sql 
                    db.query(sql, [item.parRecebimentoMpProdutoID, unidadeID], (err, result) => {
                        if (err) { res.status(500).json(err); }
                        if (result[0].count == 0) { // Insert 
                            const sql = `
                            INSERT INTO par_recebimentomp_produto_unidade (parRecebimentoMpProdutoID, unidadeID, obrigatorio)
                            VALUES (?, ?, ?)`
                            db.query(sql, [item.parRecebimentoMpProdutoID, unidadeID, (item.obrigatorio ? 1 : 0)], (err, result) => {
                                if (err) { res.status(500).json(err); }
                            });
                        } else { // Update obrigatorio
                            const sql = `
                            UPDATE par_recebimentomp_produto_unidade
                            SET obrigatorio = ?
                            WHERE parRecebimentoMpProdutoID = ? AND unidadeID = ?`
                            db.query(sql, [(item.obrigatorio ? 1 : 0), item.parRecebimentoMpProdutoID, unidadeID], (err, result) => {
                                if (err) { res.status(500).json(err); }
                            });
                        }
                    })
                } else { // Deleta
                    const sql = `
                    DELETE FROM par_recebimentomp_produto_unidade
                    WHERE parRecebimentoMpProdutoID = ? AND unidadeID = ?;`

                    db.query(sql, [item.parRecebimentoMpProdutoID, unidadeID], (err, result) => {
                        if (err) { res.status(500).json(err); }
                    })
                }
            }
        })

        // Blocos 
        blocks && blocks.forEach((block, index) => {
            if (block) {
                const sql = `
                UPDATE par_recebimentomp_bloco
                SET ordem = ?, nome = ?, obs = ?, status = ?
                WHERE parRecebimentoMpBlocoID = ?`

                db.query(sql, [block.sequencia, block.nome, (block.obs ? 1 : 0), (block.status ? 1 : 0), block.parRecebimentoMpBlocoID], (err, result) => {
                    if (err) { res.status(500).json(err); }
                })

                // Itens 
                block.itens && block.itens.forEach((item, indexItem) => {
                    if (item) {
                        if (item.parRecebimentoMpBlocoItemID) {
                            // Update
                            const sql = `
                            UPDATE par_recebimentomp_bloco_item
                            SET ordem = ?, ${item.itemID ? 'itemID = ?, ' : ''} ${item.alternativaID ? 'alternativaID = ?, ' : ''} obs = ?, obrigatorio = ?, status = ?
                            WHERE parRecebimentoMpBlocoItemID = ?`

                            db.query(sql, [item.sequencia, ...(item.itemID ? [item.itemID] : []), ...(item.alternativaID ? [item.alternativaID] : []), (item.obs ? 1 : 0), (item.obrigatorio ? 1 : 0), (item.status ? 1 : 0), item.parRecebimentoMpBlocoItemID], (err, result) => { if (err) { res.status(500).json(err); } })
                        } else {
                            // Insert
                            const sql = `
                            INSERT INTO par_recebimentomp_bloco_item (parRecebimentoMpBlocoID, ordem, itemID, alternativaID, obs, obrigatorio, status)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`

                            db.query(sql, [block.parRecebimentoMpBlocoID, item.sequencia, item.itemID, item.alternativaID, (item.obs ? 1 : 0), (item.obrigatorio ? 1 : 0), (item.status ? 1 : 0)], (err, result) => {
                                if (err) { res.status(500).json(err); }
                            })
                        }
                    }
                })
            }
        })

        // Orientações
        // const sql = `
        // UPDATE par_formulario
        // SET obs = ? 
        // WHERE parFormularioID = 1`

        // db.query(sql, [orientacoes], (err, result) => {
        //     if (err) { res.status(500).json(err); }
        // })

        res.status(200).json({ message: "Dados atualizados com sucesso." });
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
                res.status(500).json(err);
            });
    }

}

module.exports = RecebimentoMpController;