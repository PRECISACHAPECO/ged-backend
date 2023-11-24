
const { arraysIguais } = require('../../configs/config');
const db = require('../../../config/db');
const static = require('./static');
const dynamic = require('./dynamic');

const dadosFornecedor = async (req, res) => {
    const data = req.body.data

    const sqlStatus = 'SELECT status FROM fornecedor WHERE fornecedorID = ?'
    const [resultSqlStatus] = await db.promise().query(sqlStatus, [data.fornecedorID])
    const status = resultSqlStatus[0].status

    const sqlDataUnity = 'SELECT * FROM unidade WHERE unidadeID = ?'
    const [resultSqlDataUnity] = await db.promise().query(sqlDataUnity, [data.unidadeID])
    console.log("🚀 ~ resultSqlDataUnity:", resultSqlDataUnity)


    const result = {
        ...await static(data),
        unidade: resultSqlDataUnity[0].nomeFantasia
    }
    res.json(result)

    return

    // Se status maior ou igual a 40 busca os dados do fornecedor senão da configurações_fornecedor
    if (status >= 40) {
        const result = await static(data)
        console.log("🚀 ~ result:", result)
        res.json(result)

    } else {
        const result = await dynamic(data)
        res.json(result)
    }

}


module.exports = dadosFornecedor;