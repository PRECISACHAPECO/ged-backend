const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class TransportadorController {
    getList(req, res) {
        const { unidadeID } = req.body

        db.query("SELECT transportadorID AS id, nome, status FROM transportador WHERE unidadeID = ?", [unidadeID], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    getData(req, res) {
        const { id } = req.params
        db.query("SELECT * FROM transportador WHERE transportadorID = ?", [id], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result[0]);
            }
        })
    }

    insertData(req, res) {
        const { nome } = req.body.data;
        const unidadeID = req.body.unidadeID;

        db.query("SELECT * FROM transportador WHERE unidadeID = ?", [unidadeID], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const rows = result.find(row => row.nome === nome);
                if (rows) {
                    res.status(409).json(err);
                } else {
                    db.query("INSERT INTO transportador (nome, unidadeID) VALUES (?, ?)", [nome, unidadeID], (err, result) => {
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
        db.query("SELECT * FROM transportador", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                // Verifica se já existe um registro com o mesmo nome e id diferente
                const rows = result.find(row => row.nome == nome && row.transportadorID != id);
                if (rows) {
                    res.status(409).json({ message: "Dados já cadastrados!" });
                } else {
                    // Passou na validação, atualiza os dados
                    db.query("UPDATE transportador SET nome = ?, status = ? WHERE transportadorID = ?", [nome, status, id], (err, result) => {
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
            table: ['transportador'],
            column: 'transportadorID'
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

module.exports = TransportadorController;