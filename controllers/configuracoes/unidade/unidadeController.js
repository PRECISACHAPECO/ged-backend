const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class UnidadeController {
    async getList(req, res) {
        try {
            const { admin, unidadeID, usuarioID } = req.query;
            const sqlGetList = `
            SELECT unidadeID AS id, nomeFantasia AS nome, status
            FROM unidade 
            WHERE unidadeID > 0 `
            const [resultGetList] = await db.promise().query(sqlGetList)
            res.status(200).json(resultGetList);
        } catch (error) {
            console.log(error)
        }

    }

    async getData(req, res) {
        try {
            const { id } = req.params
            const sqlGetData = 'SELECT * FROM unidade WHERE unidadeID = ?'
            const [resultSqlGetData] = await db.promise().query(sqlGetData, id)
            const result = {
                fields: resultSqlGetData[0]
            }
            res.status(200).json(result);
        } catch (error) {
            console.log(error)
        }
    }

    async insertData(req, res) {
        try {
            const data = req.body;
            const sqlExist = 'SELECT * FROM unidade'
            const [resultSqlExist] = await db.promise().query(sqlExist)

            const rows = resultSqlExist.find(row => row.cnpj === data.cnpj);

            if (!rows) {
                const sqlInsert = 'INSERT INTO unidade SET ?'
                const resultSqlInsert = await db.promise().query(sqlInsert, data)
                console.log("🚀 ~ resultSqlInsert:", resultSqlInsert)
            }
            res.status(201).json({ message: 'Cadastro realizado com sucesso!' });

        } catch (error) {
            console.log(error)
        }
    }

    async updateData(req, res) {
        try {
            const { id } = req.params
            const data = req.body

            const sqlExist = 'SELECT * FROM unidade'
            const resultSqlExist = await db.promise().query(sqlExist)

            const rows = resultSqlExist[0].find(row => row.cnpj == data.cnpj && row.unidadeID !== id);
            if (rows > 0) return res.status(409).json({ message: "CNPJ já cadastrado!" });

            const sqlUpdate = 'UPDATE unidade SET ? WHERE unidadeID = ?'
            const resultSqlUpdate = await db.promise().query(sqlUpdate, [data, id])
            res.status(200).json({ message: 'Unidade atualizada com sucesso!' });
        } catch (error) {
            console.log(error)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['unidade'],
            column: 'unidadeID'
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

module.exports = UnidadeController;