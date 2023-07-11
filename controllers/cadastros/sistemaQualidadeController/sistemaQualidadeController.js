const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');

class SistemaQualidadeController {
    async getList(req, res) {
        try {
            const getList = 'SELECT sistemaqualidadeID AS id, nome, status FROM sistemaqualidade'
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

            if (await hasConflict(values.fields.nome, id, 'sistemaqualidade', 'sistemaqualidadeID')) {
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
        const objModule = {
            table: ['sistemaqualidade'],
            column: 'sistemaqualidadeID'
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



module.exports = SistemaQualidadeController;