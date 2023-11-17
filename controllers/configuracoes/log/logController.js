const db = require('../../../config/db');

class LogController {
    async getList(req, res) {
        const { id } = req.params;

        try {
            const sqlgetList = `
            SELECT 
                a.logID,
                a.nome, 
                DATE(a.dataHora) AS data,
                TIME(a.dataHora) AS hora,
                b.nome AS usuario,
                c.nomeFantasia AS unidade
            FROM log AS a
                JOIN usuario AS b ON (a.usuarioID = b.usuarioID)
                JOIN unidade AS c ON (a.unidadeID = c.unidadeID)
            WHERE a.unidadeID = ?;`
            const [resultGetList] = await db.promise().query(sqlgetList, [id])

            res.status(200).json(resultGetList)

        } catch (err) {
            console.log(err);
        }
    }

    async getData(req, res) {
        const { id } = req.params;

        try {
            const sqlgetOne = `SELECT * FROM log_script WHERE logID = ?`
            const [resultGetOne] = await db.promise().query(sqlgetOne, [id])

            res.status(200).json(resultGetOne)
        } catch (err) {
            console.log(err)
        }

    }
}



module.exports = LogController;