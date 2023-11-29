
const db = require('../../config/db');
const { extrairEnderecoCompleto } = require('../../config/defaultConfig');

const headerReport = async (req, res) => {
    let data = req.body
    console.log("🚀 ~ data:", data)
    let unidadeID = data.unidadeID

    //? Se fornecedor: Obtém unidadeID da fábrica (quem define o padrão do formulário)
    if (data.papelID == 2) {
        const sqlUnity = `SELECT *, unidadeID FROM fornecedor WHERE fornecedorID = ? LIMIT 1`;
        const [resultUnidade] = await db.promise().query(sqlUnity, [data.fornecedorID]);
        unidadeID = resultUnidade[0]?.unidadeID //? unidadeID da fábrica
    }

    const sqlGetCabecalhoReport = 'SELECT * FROM unidade WHERE unidadeID = ?'
    const [resultSqlGetCabecalhoReport] = await db.promise().query(sqlGetCabecalhoReport, [unidadeID]);

    if (resultSqlGetCabecalhoReport.length == 0) return

    console.log("🚀 ~ unidadeID:", unidadeID)
    const result = {
        unidade: {
            ...resultSqlGetCabecalhoReport[0],
            url: resultSqlGetCabecalhoReport[0].cabecalhoRelatorio ? `${process.env.BASE_URL_UPLOADS}${resultSqlGetCabecalhoReport[0].cabecalhoRelatorio}` : null,
            endereco: extrairEnderecoCompleto(resultSqlGetCabecalhoReport[0]),
        }
    }

    res.json(result)

}

module.exports = headerReport;
