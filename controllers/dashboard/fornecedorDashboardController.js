const db = require('../../config/db');

class fornecedorDashboardController {

    async getData(req, res) {
        const data = req.body
        console.log("🚀 ~ data:", data)

        try {
            const getLastForms = `
            SELECT
                u.nomeFantasia AS fabrica,
                DATE_FORMAT(f.dataInicio, '%d/%m/%Y') AS dataCriacao_formatada,
                e.nome AS status,
                e.cor,
                u.cabecalhoRelatorio AS logo,
                DATEDIFF(CURDATE(), f.dataInicio) AS quantidadeDias
            FROM fornecedor AS f
                LEFT JOIN unidade AS u ON f.unidadeID = u.unidadeID
                LEFT JOIN status AS e ON f.status = e.statusID
            WHERE f.cnpj = ?
            ORDER BY f.status ASC;`

            const [resultLastForms] = await db.promise().query(getLastForms, [data.cnpj])

            const values = {
                lastForms: resultLastForms
            }

            res.status(200).json(values)
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = fornecedorDashboardController;