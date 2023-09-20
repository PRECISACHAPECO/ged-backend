const db = require('../../config/db');

class FabricaController {

    async getData(req, res) {
        try {
            const { unidadeID } = req.params

            //? Traz o total de forncedor agrupado por status
            const sqlTotalSupplier = `
            SELECT
                a.nome AS title,
                a.cor AS color,
                a.icone AS icon,
                a.statusID,
                COUNT(DISTINCT b.cnpj) AS stats
            FROM
                status AS a 
                LEFT JOIN fornecedor AS b ON (a.statusID = b.status AND b.unidadeID = ?)
            WHERE a.statusID IN (10, 20, 30, 40)
            GROUP BY a.nome
            ORDER BY a.statusID ASC`
            const [resultSqlTotalSupplier] = await db.promise().query(sqlTotalSupplier, [unidadeID])

            //? Traz o total de recebimentoBP agrupado por status
            const sqlTotalRecebimentoNC = `
            SELECT 
                CONCAT(
                    CASE 
                        WHEN MONTH(r.data) = 1 THEN 'Jan'
                        WHEN MONTH(r.data) = 2 THEN 'Fev'
                        WHEN MONTH(r.data) = 3 THEN 'Mar'
                        WHEN MONTH(r.data) = 4 THEN 'Abr'
                        WHEN MONTH(r.data) = 5 THEN 'Mai'
                        WHEN MONTH(r.data) = 6 THEN 'Jun'
                        WHEN MONTH(r.data) = 7 THEN 'Jul'
                        WHEN MONTH(r.data) = 8 THEN 'Ago'
                        WHEN MONTH(r.data) = 9 THEN 'Set'
                        WHEN MONTH(r.data) = 10 THEN 'Out'
                        WHEN MONTH(r.data) = 11 THEN 'Nov'
                        WHEN MONTH(r.data) = 12 THEN 'Dez'
                    END,
                    '/',
                    DATE_FORMAT(r.data, '%y')
                ) AS month,
                COUNT(*) AS mp,
                (SELECT COUNT(*) 
                FROM recebimentomp_naoconformidade AS nc
                WHERE nc.recebimentompID = r.recebimentompID ) AS nc
            FROM 
                recebimentomp AS r
            WHERE 
                r.data IS NOT NULL
                AND r.unidadeID = ?
            GROUP BY 
                MONTH(r.data), YEAR(r.data)
            ORDER BY 
                r.data ASC`
            const [resultSqlTotalRecebimentoNC] = await db.promise().query(sqlTotalRecebimentoNC, [unidadeID])

            //? Limpeza
            const sqlLimpeza = `
            SELECT 
                lm.nome, 
                lm.ciclo, 
                DATE_FORMAT(MAX(l.data), '%d/%m/%Y') AS ultimo,	
                DATE_FORMAT(DATE_ADD(MAX(l.data), INTERVAL lm.ciclo DAY), '%d/%m/%Y') AS limite,
                DATEDIFF(DATE_ADD(MAX(l.data), INTERVAL lm.ciclo DAY), CURDATE()) AS diasRestantes,
                (100 - ((DATEDIFF(DATE_ADD(MAX(l.data), INTERVAL lm.ciclo DAY), CURDATE()) * 100) / lm.ciclo)) AS porcentagem
            FROM limpeza AS l 
                JOIN par_limpeza_modelo AS lm ON (l.parLimpezaModeloID = lm.parLimpezaModeloID)
            WHERE l.unidadeID = ? AND lm.status = 1
            GROUP BY lm.parLimpezaModeloID
            ORDER BY DATEDIFF(DATE_ADD(MAX(l.data), INTERVAL lm.ciclo DAY), CURDATE()) ASC`
            const [resultSqlLimpeza] = await db.promise().query(sqlLimpeza, [unidadeID])

            const values = {
                fornecedorPorStatus: resultSqlTotalSupplier,
                totalRecebimentoNC: resultSqlTotalRecebimentoNC,
                limpeza: resultSqlLimpeza
            }
            res.status(200).json(values)
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = FabricaController;