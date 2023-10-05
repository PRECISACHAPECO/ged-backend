const db = require('../../config/db');

class FornecedorController {

    async getData(req, res) {
        try {
            const { unidadeID } = req.params
            console.log("🚀 ~ unidadeID:", unidadeID)

            res.status(200).json(values)
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = FornecedorController;