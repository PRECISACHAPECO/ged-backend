const db = require('../config/db');

class AtividadeController {    
    getList(req, res) {
        db.query("SELECT * FROM register", (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
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

    deleteData(req, res) {
        const { id } = req.params
        db.query("DELETE FROM register WHERE registerID = ?", [id], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }
}

module.exports = AtividadeController;