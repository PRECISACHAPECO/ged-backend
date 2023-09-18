const db = require('../../config/db');

class FabricaController {

    async getData(req, res) {
        try {
            const { unidadeID } = req.params

            //? Traz o total de forncedor agrupado por status
            const sqlTotalSupplier = `
            SELECT
            status AS statusID,
                CASE status
                    WHEN 10 THEN 'Pendente'
                    WHEN 20 THEN 'Acessou o link'
                    WHEN 30 THEN 'Em preenchimento'
                    WHEN 40 THEN 'Finalizou preenchimento'
                END AS nome_status,
                COUNT(DISTINCT cnpj) AS total
            FROM
                fornecedor
            WHERE
                unidadeID = 1
                AND status IN (10, 20, 30, 40)
            GROUP BY
                nome_status;
            `
            const [resultSqlTotalSupplier] = await db.promise().query(sqlTotalSupplier, [unidadeID])


            const values = {
                fornecedorPorStatus: resultSqlTotalSupplier
            }
            res.status(200).json(values)
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = FabricaController;