const db = require('../../../../config/db');
const { hasPending, deleteItem } = require('../../../../config/defaultConfig');

class FornecedorController {

    getData(req, res) {
        const unidadeID = 1;

        const sql = `
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
        ORDER BY pf.ordem ASC;`

        db.query(sql, [unidadeID, unidadeID], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    updateData(req, res) {
        const unidadeID = 1
        const data = req.body
        console.log('data: ', data)

        // Varre data e verifica o campo "mostra", se "mostra" for true, então realiza insert em "par_fornecedor_unidade" se não houver registro, se houver, atualiza o campo "obrigatorio", se não tiver "mostra" ou "mostra" for false, então realiza delete em "par_fornecedor_unidade" se houver registro
        data.forEach((item) => {
            if (item) {
                if (item.mostra) {
                    // Verifica se já existe registro em "par_fornecedor_unidade" para o fornecedor e unidade
                    const sql = `
                    SELECT COUNT(*) AS count
                    FROM par_fornecedor_unidade AS pfu
                    WHERE pfu.parFornecedorID = ? AND pfu.unidadeID = ?`
                    // Verificar numero de linhas do sql 
                    db.query(sql, [item.parFornecedorID, unidadeID], (err, result) => {
                        if (err) { res.status(500).json(err); }
                        if (result.length == 0) { // Insert 
                            console.log('parID: ', item.parFornecedorID)
                            
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
                    console.log('Mostra')
                } else { // Deleta
                    const sql = `
                    DELETE FROM par_fornecedor_unidade
                    WHERE parFornecedorID = ? AND unidadeID = ?;`

                    db.query(sql, [item.parFornecedorID, unidadeID], (err, result) => {
                        if (err) { res.status(500).json(err); }
                    })
                    console.log('Remove')
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