const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class UnidadeController {
    getList(req, res) {
        db.query("SELECT unidadeID AS id, nome, status FROM unidade", (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    getData(req, res) {
        const { id } = req.params
        db.query("SELECT * FROM unidade WHERE unidadeID = ?", [id], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result[0]);
            }
        })
    }

    insertData(req, res) {
        const data = req.body;
        db.query("SELECT * FROM unidade", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const rows = result.find(row => row.cnpj === data.cnpj);
                if (rows) {
                    res.status(409).json(err);
                } else {
                    db.query("INSERT INTO unidade SET ?", [data], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json(err);
                        } else {
                            res.status(201).json(result);
                        }
                    });
                }
            }
        })
    }

    updateData(req, res) {
        const { id } = req.params
        const data = req.body

        console.log(data)

        db.query("SELECT * FROM unidade", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const rows = result.find(row => row.cnpj == data.cnpj && row.unidadeID !== id);
                if (rows > 0) {
                    res.status(409).json({ message: "CNPJ já cadastrado!" });
                } else {
                    // Passou na validação, atualiza os dados
                    db.query("UPDATE unidade SET ? WHERE unidadeID = ?", [data, id], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json(err);
                        } else {
                            res.status(200).json({ message: 'Unidade atualizada com sucesso!' });
                        }
                    });
                }
            }
        })
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: 'unidade',
            column: 'unidadeID'
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

module.exports = UnidadeController;