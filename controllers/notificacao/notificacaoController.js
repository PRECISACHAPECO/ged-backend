const db = require('../../config/db');

class NotificacaoController {

    async getData(req, res) {
        const { unidadeID, usuarioID } = req.body

        const sqlGet = `
        SELECT 
        a.*,
        b.nome AS tipoNotificacao,
        b.icone AS icone,
        b.cor AS cor,
        CASE
            WHEN DATE(a.dataHora) = CURDATE() THEN 'hoje'
            WHEN DATE(a.dataHora) = DATE(CURDATE() - INTERVAL 1 DAY) THEN 'ontem'
            ELSE 
                CONCAT(
                    DATEDIFF(CURDATE(), DATE(a.dataHora)),
                    ' dias'
                )
        END AS dataFormatada
    FROM notificacao AS a
    JOIN tiponotificacao AS b ON (a.tipoNotificacaoID = b.tipoNotificacaoID)
    WHERE a.usuarioID = ? AND a.unidadeID = ?
        ORDER BY a.dataHora DESC
        `

        const [resultSqlGet] = await db.promise().query(sqlGet, [usuarioID, unidadeID])

        res.status(200).json(resultSqlGet)
    }
}

module.exports = NotificacaoController;