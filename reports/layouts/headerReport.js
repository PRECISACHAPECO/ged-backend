
const db = require('../../config/db');
const path = require('path');
const fs = require('fs');

const headerReport = async (req, res) => {
    const { unidadeID } = req.body

    const sqlGetCabecalhoReport = 'SELECT tituloRelatorio, cabecalhoRelatorio FROM unidade WHERE unidadeID = ?'
    const [resultSqlGetCabecalhoReport] = await db.promise().query(sqlGetCabecalhoReport, unidadeID);
    if (resultSqlGetCabecalhoReport.length <= 0) return

    const result = {
        unidade: {
            ...resultSqlGetCabecalhoReport[0],
            url: resultSqlGetCabecalhoReport[0].cabecalhoRelatorio ? `${process.env.BASE_URL_UPLOADS}report/${resultSqlGetCabecalhoReport[0].cabecalhoRelatorio}` : null,
        }
    }

    res.json(result)

}

module.exports = headerReport;
