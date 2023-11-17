const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');
const { executeLog, executeQuery } = require('../../../config/executeQuery');

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
            const logID = executeLog('Criação de apresentação', values.usuarioID, values.unidadeID, req)
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

            const sqlInsert = 'INSERT INTO apresentacao (nome, status, dataCadastro) VALUES (?, ?, ?)'
            const id = await executeQuery(sqlInsert, [values.fields.nome, values.fields.status, new Date()], 'insert', 'apresentacao', 'apresentacaoID', null, values.usuarioID, values.unidadeID, logID)

            return res.status(200).json(id)

        } catch (error) {
            console.log(error)
        }
    }

    async updateData(req, res) {
        try {
            const { id } = req.params
            const values = req.body

            const logID = await executeLog('Atualização de apresentação', values.usuarioID, values.unidadeID, req)
            console.log("🚀 ~ logID:", logID)

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
            executeQuery(sqlUpdate, [values.fields.nome, values.fields.status, id], 'update', 'apresentacao', 'apresentacaoID', id, values.usuarioID, values.unidadeID, logID)

        } catch (error) {
            console.log(error)
        }
    }

    async deleteData(req, res) {
        const { id, usuarioID, unidadeID } = req.params

        const logID = await executeLog('Exclusão de apresentação', usuarioID, unidadeID, req)


        const objDelete = {
            table: ['apresentacao'],
            column: 'apresentacaoID'
        }


        const arrPending = [
            {
                table: 'recebimentomp_produto',
                column: ['apresentacaoID'],
            },

        ]

        if (!arrPending || arrPending.length === 0) {
            return deleteItem(id, objDelete.table, objDelete.column, res, usuarioID, unidadeID, logID)
        }

        hasPending(id, arrPending)
            .then((hasPending) => {
                if (hasPending) {
                    res.status(409).json({ message: "Dado possui pendência." });
                } else {
                    return deleteItem(id, objDelete.table, objDelete.column, res, usuarioID, unidadeID, logID)
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    }
}



module.exports = ApresentacaoController;