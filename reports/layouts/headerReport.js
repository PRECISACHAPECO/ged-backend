
const db = require('../../config/db');

const headerReport = async (req, res) => {
    let { id, unidadeID, isFornecedor } = req.body
    console.log("🚀 ~ id, unidadeID, isFornecedor:", id, unidadeID, isFornecedor)

    //? Se fornecedor: Obtém unidadeID da fábrica (quem define o padrão do formulário)
    if (isFornecedor) {
        const sqlUnity = `SELECT *, unidadeID FROM fornecedor WHERE fornecedorID = ? LIMIT 1`;
        const [resultUnidade] = await db.promise().query(sqlUnity, id);
        unidadeID = resultUnidade[0]['unidadeID'] //? unidadeID da fábrica
    }

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
