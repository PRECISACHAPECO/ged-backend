
const db = require('../../../../config/db');

const dadosRecebimentoMp = async (req, res) => {
    const data = req.body
    console.log(data)
    return

    const result = {
        name: 'Jonatan'
    };
    res.json(result)
}


module.exports = dadosRecebimentoMp;