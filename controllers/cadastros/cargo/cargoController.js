const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');

class CargoController {

    // Lista todos os cargos disponiveis na unidade
    async getList(req, res) {
        const { unidadeID } = req.params
        try {
            const sqlList = `
            SELECT 
                a.cargoID AS id, 
                a.nome, 
                e.nome AS status,
                e.cor
            FROM cargo AS a
                JOIN status AS e ON (a.status = e.statusID)
            WHERE a.unidadeID = ?
            `

            const [resultSqlList] = await db.promise().query(sqlList, [unidadeID])

            res.status(200).json(resultSqlList);
        } catch (e) {
            console.log(e)
        }
    }

    // Lista as informações do cargo selecionado
    async getData(req, res) {
        try {
            const { id } = req.params

            const sqlGet = `SELECT * FROM cargo WHERE cargoID = ?`
            const [resultSqlGet] = await db.promise().query(sqlGet, [id])
            const result = {
                fields: resultSqlGet[0]
            }
            res.status(200).json(result);
        } catch (e) {
            console.log(e)
        }
    }

    // Insere um novo cargo na unidade logada
    async insertData(req, res) {
        try {
            const values = req.body

            //* Valida conflito
            const validateConflicts = {
                columns: ['nome', 'unidadeID'],
                values: [values.fields.nome, values.fields.unidadeID],
                table: 'cargo',
                id: null
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            const sqlInsert = 'INSERT INTO cargo (nome, status, unidadeID) VALUES (?, ?, ?)'
            const [resultSqlInsert] = await db.promise().query(sqlInsert, [values.fields.nome, values.fields.status, values.fields.unidadeID])
            const id = resultSqlInsert.insertId
            return res.status(200).json(id)
        } catch (error) {
            console.log(error)
        }
    }

    // Atualiza cargo na unidade logada
    async updateData(req, res) {
        try {
            const { id } = req.params
            const values = req.body

            //* Valida conflito
            const validateConflicts = {
                columns: ['cargoID', 'nome'],
                values: [id, values.fields.nome],
                table: 'cargo',
                id: id
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            const sqlUpdate = `UPDATE cargo SET nome = ?, status = ? WHERE cargoID = ?`
            const [resultSqlUpdat] = await db.promise().query(sqlUpdate, [values.fields.nome, values.fields.status, id])

            return res.status(200).json({ message: 'Dados atualizados com sucesso' })
        } catch (error) {
            console.log(error)
        }
    }

    // Deleta um cargo da unidade logada
    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['cargo'],
            column: 'cargoID'
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

module.exports = CargoController;