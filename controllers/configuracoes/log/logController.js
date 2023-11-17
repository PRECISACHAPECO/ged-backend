const db = require('../../../config/db');

class LogController {
    async getList(req, res) {
        const { unidadeID } = req.params;

        try {
            const sqlgetList = `
            SELECT 
                a.logID AS id,
                a.nome, 
                a.ip,
                DATE_FORMAT(a.dataHora, '%d/%m/%Y %h:%i') AS dataHora,
                b.nome AS usuario,
                (
                    SELECT GROUP_CONCAT(ls.tabela SEPARATOR ', ')
                    FROM log_script AS ls
                    WHERE ls.logID = a.logID
                ) AS tabelas,
                (
                    SELECT GROUP_CONCAT(ls.operacao SEPARATOR ', ')
                    FROM log_script AS ls
                    WHERE ls.logID = a.logID
                ) AS operacoes,
                (
                    SELECT GROUP_CONCAT(ls.alteracao SEPARATOR ', ')
                    FROM log_script AS ls
                    WHERE ls.logID = a.logID
                ) AS scripts
            FROM log AS a
                JOIN usuario AS b ON (a.usuarioID = b.usuarioID)
            WHERE a.unidadeID = ?`
            const [resultGetList] = await db.promise().query(sqlgetList, [unidadeID])

            res.status(200).json(resultGetList)

        } catch (err) {
            console.log(err);
        }
    }

    async getData(req, res) {
        const { unidadeID } = req.params;

        try {
            const sqlgetOne = `SELECT * FROM log_script WHERE logID = ?`
            const [resultGetOne] = await db.promise().query(sqlgetOne, [unidadeID])

            res.status(200).json(resultGetOne)
        } catch (err) {
            console.log(err)
        }

    }
}



module.exports = LogController;