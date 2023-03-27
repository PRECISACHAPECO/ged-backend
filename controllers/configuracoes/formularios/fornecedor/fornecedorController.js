const db = require('../../../../config/db');
const { hasPending, deleteItem } = require('../../../../config/defaultConfig');

class FornecedorController {

    getData(req, res) {
        const unidadeID = 1;

        const sql = `
        SELECT * 
        FROM par_fornecedor AS pf 
            JOIN par_fornecedor_unidade AS pfu ON (pf.parFornecedorID = pfu.parFornecedorID)
        WHERE pfu.unidadeID = ?
        ORDER BY pf.ordem ASC`

        db.query(sql, [unidadeID], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    insertData(req, res) {
        const { nome } = req.body;
        db.query("SELECT * FROM item", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const rows = result.find(row => row.nome === nome);
                if (rows) {
                    res.status(409).json(err);
                } else {
                    db.query("INSERT INTO item (nome) VALUES (?)", [nome], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json(err);
                        } else {
                            res.status(201).json(result);
                        }
                    });
                }
            }
        });
    }

    updateData(req, res) {
        const { id } = req.params
        const { nome, status } = req.body
        db.query("SELECT * FROM item", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                // Verifica se já existe um registro com o mesmo nome e id diferente
                const rows = result.find(row => row.nome == nome && row.itemID != id);
                if (rows) {
                    res.status(409).json({ message: "Dados já cadastrados!" });
                } else {
                    // Passou na validação, atualiza os dados
                    db.query("UPDATE item SET nome = ?, status = ? WHERE itemID = ?", [nome, status, id], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(result);
                        }
                    });
                }
            }
        })
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