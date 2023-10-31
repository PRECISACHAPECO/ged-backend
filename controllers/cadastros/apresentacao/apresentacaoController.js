const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');

class ApresentacaoController {
    async getList(req, res) {
        try {
            const getList = `
            SELECT 
                a.apresentacaoID AS id, 
                a.nome, 
                e.nome AS status,
                e.cor 
            FROM apresentacao AS a
                JOIN status AS e ON (a.status = e.statusID)
            ORDER BY a.nome ASC`
            const [resultGetList] = await db.promise().query(getList);
            res.status(200).json(resultGetList);
        } catch (error) {
            console.log(error)
        }
    }

    async getData(req, res) {
        try {
            const { id } = req.params
            const sqlGet = `SELECT * FROM apresentacao WHERE apresentacaoID = ?`
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
                table: 'apresentacao',
                id: null
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            const sqlInsert = 'INSERT INTO apresentacao (nome, status) VALUES (?, ?)'
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
                columns: ['apresentacaoID', 'nome'],
                values: [id, values.fields.nome],
                table: 'apresentacao',
                id: id
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            const sqlUpdate = `UPDATE apresentacao SET nome = ?, status = ? WHERE apresentacaoID = ?`
            const [resultSqlUpdat] = await db.promise().query(sqlUpdate, [values.fields.nome, values.fields.status, id])

            return res.status(200).json({ message: 'Dados atualizados com sucesso' })
        } catch (error) {
            console.log(error)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['apresentacao'],
            column: 'apresentacaoID'
        }
        const tablesPending = ['recebimentomp_produto'] // Tabelas que possuem relacionamento com a tabela atual

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



module.exports = ApresentacaoController;