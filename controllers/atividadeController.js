const db = require('../config/db');

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
        const { description } = req.body
        db.query("INSERT INTO register(description) VALUES (?)", [description], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    updateData(req, res) {
        const { id } = req.params
        const { nome, status } = req.body
        db.query("UPDATE atividade SET nome = ?, status = ?  WHERE atividadeID = ?", [nome, status, id], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    deleteData(req, res) {
        const { id } = req.params
        db.query("DELETE FROM atividade WHERE atividadeID = ?", [id], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }
}

module.exports = AtividadeController;