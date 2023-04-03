const db = require('../../../../config/db');
const { hasPending, deleteItem } = require('../../../../config/defaultConfig');

class FornecedorController {

    async getData(req, res) {
        const functionName = req.headers['function-name'];
        const unidadeID = req.params.id;

        switch (functionName) {
            // Obtém cabeçalho do formulário
            case 'getHeader':
                const sql1 = `
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
                ORDER BY pf.ordem ASC;`;

                try {
                    const result1 = await db.promise().query(sql1, [unidadeID, unidadeID]);
                    res.status(200).json(result1[0]);
                } catch (err) {
                    res.status(500).json(err);
                }
                break;

            // Obtem as opções pra seleção da listagem dos selects de itens e alternativas
            case 'getOptionsItens':
                const sqlItem = `SELECT * FROM item ORDER BY nome ASC;`;
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
                    const sqlBloco = `SELECT * FROM par_fornecedor_bloco WHERE unidadeID = ? ORDER BY ordem ASC`;
                    const [resultBloco] = await db.promise().query(sqlBloco, [unidadeID]);

                    const sqlAtividade = `
                    SELECT a.*, 
                        (SELECT IF(COUNT(*) > 0, 1, 0)
                        FROM par_fornecedor_bloco_atividade AS pfba 
                        WHERE pfba.atividadeID = a.atividadeID AND pfba.parFornecedorBlocoID = ? AND pfba.unidadeID = ?) AS checked
                    FROM atividade AS a 
                    ORDER BY a.nome ASC;`;

                    const sqlItem = `
                    SELECT pfbi.*, i.*, a.nome AS alternativa 
                    FROM par_fornecedor_bloco_item AS pfbi 
                        LEFT JOIN item AS i ON (pfbi.itemID = i.itemID)
                        LEFT JOIN alternativa AS a ON (pfbi.alternativaID = a.alternativaID)
                    WHERE pfbi.parFornecedorBlocoID = ?
                    ORDER BY pfbi.ordem ASC`

                    // Varre bloco
                    for (const item of resultBloco) {
                        const [resultAtividade] = await db.promise().query(sqlAtividade, [item.parFornecedorBlocoID, unidadeID]);
                        const [resultItem] = await db.promise().query(sqlItem, [item.parFornecedorBlocoID]);

                        const objData = {
                            dados: item,
                            atividades: resultAtividade,
                            categrias: [
                                {
                                    id: 1,
                                    nome: 'Fabricante',
                                    checked: 1
                                },
                                {
                                    id: 2,
                                    nome: 'Importador',
                                    checked: 0
                                }
                            ],
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
        const data = req.body
        // Varre data e verifica o campo "mostra", se "mostra" for true, então realiza insert em "par_fornecedor_unidade" se não houver registro, se houver, atualiza o campo "obrigatorio", se não tiver "mostra" ou "mostra" for false, então realiza delete em "par_fornecedor_unidade" se houver registro
        data.forEach((item) => {
            if (item) {
                if (item.mostra) {
                    // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                    const sql = `
                    SELECT COUNT(*) AS count
                    FROM par_fornecedor_unidade AS pfu
                    WHERE pfu.parFornecedorID = ? AND pfu.unidadeID = ?`
                    // Verifica numero de linhas do sql 
                    db.query(sql, [item.parFornecedorID, unidadeID], (err, result) => {
                        if (err) { res.status(500).json(err); }
                        if (result[0].count == 0) { // Insert 
                            const sql = `
                            INSERT INTO par_fornecedor_unidade (parFornecedorID, unidadeID, obrigatorio)
                            VALUES (?, ?, ?)`
                            db.query(sql, [item.parFornecedorID, unidadeID, (item.obrigatorio ? 1 : 0)], (err, result) => {
                                if (err) { res.status(500).json(err); }
                            });
                        } else { // Update obrigatorio
                            const sql = `
                            UPDATE par_fornecedor_unidade
                            SET obrigatorio = ?
                            WHERE parFornecedorID = ? AND unidadeID = ?`
                            db.query(sql, [(item.obrigatorio ? 1 : 0), item.parFornecedorID, unidadeID], (err, result) => {
                                if (err) { res.status(500).json(err); }
                            });
                        }
                    })
                } else { // Deleta
                    const sql = `
                    DELETE FROM par_fornecedor_unidade
                    WHERE parFornecedorID = ? AND unidadeID = ?;`

                    db.query(sql, [item.parFornecedorID, unidadeID], (err, result) => {
                        if (err) { res.status(500).json(err); }
                    })
                }
            }
        })
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
                console.log(err);
                res.status(500).json(err);
            });
    }

}

module.exports = FornecedorController;