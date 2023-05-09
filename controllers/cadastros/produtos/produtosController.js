const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class ProdutosController {
    getList(req, res) {
        const { unidadeID } = req.body

        db.query("SELECT produtoID AS id, nome, unidadeMedida, status FROM produto WHERE unidadeID = ?", [unidadeID], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    getData(req, res) {
        const { id } = req.params
        db.query("SELECT * FROM produto WHERE produtoID = ?", [id], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result[0]);
            }
        })
    }

    insertData(req, res) {
        const { nome, unidadeMedida } = req.body.data;
        const unidadeID = req.body.unidadeID;

        db.query("SELECT * FROM produto WHERE unidadeID = ?", [unidadeID], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const rows = [] //result.find(row => row.nome === nome);
                if (rows) {
                    res.status(409).json(err);
                } else {
                    db.query("INSERT INTO produto (nome, unidadeMedida, unidadeID) VALUES (?, ?, ?)", [nome, unidadeMedida, unidadeID], (err, result) => {
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
        const { nome, unidadeMedida, status } = req.body
        db.query("SELECT * FROM produto", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                // Verifica se já existe um registro com o mesmo nome e id diferente
                const rows = [] //result.find(row => row.nome == nome && row.produtoID != id);
                if (rows) {
                    res.status(409).json({ message: "Dados já cadastrados!" });
                } else {
                    // Passou na validação, atualiza os dados
                    db.query("UPDATE produto SET nome = ?, unidadeMedida = ?,  status = ? WHERE produtoID = ?", [nome, unidadeMedida, status, id], (err, result) => {
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
            table: 'produto',
            column: 'produtoID'
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

module.exports = ProdutosController;