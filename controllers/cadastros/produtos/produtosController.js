const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');

class ProdutosController {
    async getList(req, res) {
        try {
            const { unidadeID } = req.body

            if (!unidadeID) {
                return res.status(400).json({ message: "Dados inválidos!" });
            }

            const getList = 'SELECT produtoID AS id, nome, status, unidadeMedida FROM produto WHERE unidadeID = ? ORDER BY nome ASC'
            const [resultGetList] = await db.promise().query(getList, [unidadeID]);
            res.status(200).json(resultGetList);
        } catch (error) {
            console.log(error)
        }
    }

    async getData(req, res) {
        try {
            const { id } = req.params
            const sqlGet = `SELECT * FROM produto WHERE produtoID = ?`
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
                columns: ['nome', 'unidadeID', 'unidadeMedida'],
                values: [values.fields.nome, values.fields.unidadeID, values.fields.unidadeMedida],
                table: 'produto',
                id: null
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            const sqlInsert = 'INSERT INTO produto (nome, status, unidadeMedida, unidadeID) VALUES (?, ?, ?, ?)'
            const [resultSqlInsert] = await db.promise().query(sqlInsert, [values.fields.nome, values.fields.status, values.fields.unidadeMedida, values.fields.unidadeID])
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
                columns: ['produtoID', 'nome', 'unidadeMedida'],
                values: [id, values.fields.nome, values.fields.unidadeMedida],
                table: 'produto',
                id: id
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            const sqlUpdate = `UPDATE produto SET nome = ?, unidadeMedida = ?, status = ? WHERE produtoID = ?`
            const [resultSqlUpdat] = await db.promise().query(sqlUpdate, [values.fields.nome, values.fields.unidadeMedida, values.fields.status, id])

            return res.status(200).json({ message: 'Dados atualizados com sucesso' })
        } catch (error) {
            console.log(error)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['produto'],
            column: 'produtoID'
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



module.exports = ProdutosController;