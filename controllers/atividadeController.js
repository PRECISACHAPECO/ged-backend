const db = require('../config/db');
const hasPending = require('../config/defaultConfig');

class AtividadeController {
    getList(req, res) {
        db.query("SELECT atividadeID AS id, nome, status FROM atividade", (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }
    getData(req, res) {
        const { id } = req.params
        db.query("SELECT * FROM atividade WHERE atividadeID = ?", [id], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result[0]);
            }
        })
    }

    insertData(req, res) {
        const { nome } = req.body;
        db.query("SELECT * FROM atividade", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const atividades = result.find(atividade => atividade.nome === nome);
                if (atividades) {
                    res.status(409).json(err);
                } else {
                    db.query("INSERT INTO atividade (nome) VALUES (?)", [nome], (err, result) => {
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
        db.query("SELECT * FROM atividade", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                // Verifica se já existe um registro com o mesmo nome e id diferente
                const atividades = result.find(atividade => atividade.nome == nome && atividade.atividadeID != id);
                if (atividades) {
                    res.status(409).json({ message: "Dados já cadastrada!" });
                } else {
                    // Passou na validação, atualiza os dados
                    db.query("UPDATE atividade SET nome = ?, status = ? WHERE atividadeID = ?", [nome, status, id], (err, result) => {
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

    async deleteData(req, res) {
        const { id } = req.params

        hasPending(id, 'atividadeID', ['fornecedoravaliacao_atividade'])
            .then((hasPending) => {
                if (hasPending) {
                    res.status(409).json({ message: "Dado possui pendência." });
                } else {
                    db.query("DELETE FROM atividade WHERE atividadeID = ?", [id], (err, result) => {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(result);
                        }
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    }
}

module.exports = AtividadeController;