const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');

class SistemaQualidadeController {
    async getList(req, res) {
        try {
            const getList = `
            SELECT 
            a.sistemaqualidadeID AS id, 
            a.nome, 
            e.nome AS status,
            e.cor
            FROM sistemaqualidade AS a
            LEFT JOIN status AS e ON (a.status = e.statusID)
            `
            const [resultGetList] = await db.promise().query(getList);
            res.status(200).json(resultGetList);
        } catch (error) {
            console.log(error)
        }
    }

    async getData(req, res) {
        try {
            const { id } = req.params
            const sqlGet = `SELECT * FROM sistemaqualidade WHERE sistemaqualidadeID = ?`
            const [resultSqlGet] = await db.promise().query(sqlGet, id)
            const result = {
                fields: resultSqlGet[0]
            }
            return res.status(200).json(result)
        } catch (error) {
            console.log(error)
        }
    }

    async insertData(req, res) {
        const values = req.body
        try {

            //* Valida conflito
            const validateConflicts = {
                columns: ['nome'],
                values: [values.fields.nome],
                table: 'sistemaqualidade',
                id: null
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            const sqlInsert = 'INSERT INTO sistemaqualidade (nome, status) VALUES (?, ?)'
            const [resultSqlInsert] = await db.promise().query(sqlInsert, [values.fields.nome, values.fields.status])
            const id = resultSqlInsert.insertId
            return res.status(200).json(id)

        } catch (error) {
            console.log(error)
        }
    }

    async updateData(req, res) {
        try {
            const { id } = req.params
            const values = req.body

            //* Valida conflito
            const validateConflicts = {
                columns: ['sistemaqualidadeID', 'nome'],
                values: [id, values.fields.nome],
                table: 'sistemaqualidade',
                id: id
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            const sqlUpdate = `UPDATE sistemaqualidade SET nome = ?, status = ? WHERE sistemaqualidadeID = ?`
            const [resultSqlUpdat] = await db.promise().query(sqlUpdate, [values.fields.nome, values.fields.status, id])

            return res.status(200).json({ message: 'Dados atualizados com sucesso' })
        } catch (error) {
            console.log(error)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objDelete = {
            table: ['sistemaqualidade'],
            column: 'sistemaqualidadeID'
        }

        const arrPending = [
            {
                table: 'fornecedor_sistemaqualidade',
                column: ['sistemaqualidadeID',],
            },

        ]

        if (!arrPending || arrPending.length === 0) {
            return deleteItem(id, objDelete.table, objDelete.column, res)
        }

        hasPending(id, arrPending)
            .then((hasPending) => {
                if (hasPending) {
                    res.status(409).json({ message: "Dado possui pendência." });
                } else {
                    return deleteItem(id, objDelete.table, objDelete.column, res)
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    }
}



module.exports = SistemaQualidadeController;