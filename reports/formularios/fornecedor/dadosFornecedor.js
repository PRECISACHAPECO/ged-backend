
const db = require('../../../config/db');
const { arraysIguais } = require('../../configs/config');

const dadosFornecedor = async (req, res) => {
    const data = req.body
    console.log("🚀 ~ data:", data)
    return




    const result = {
        fields: resultData

    }

    res.json(result)

}


module.exports = dadosFornecedor;