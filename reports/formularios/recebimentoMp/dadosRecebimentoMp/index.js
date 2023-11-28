
const db = require('../../../../config/db');

const dadosRecebimentoMp = async (req, res) => {
    const data = req.body.data


    const result = {
        name: 'Jonatan'
    };
    res.json(result)
}


module.exports = dadosRecebimentoMp;