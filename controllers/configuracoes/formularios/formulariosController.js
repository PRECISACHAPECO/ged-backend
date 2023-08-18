const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class FormulariosController {
    getList(req, res) {
        db.query("SELECT parFormularioID AS id, nome FROM par_formulario", (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

}

module.exports = FormulariosController;