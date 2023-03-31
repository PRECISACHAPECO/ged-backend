const db = require('../../config/db');

class AuthController {
    login(req, res) {
        const { email, password } = req.body;

        db.query("SELECT * FROM usuario WHERE email = ? AND password = ?", [email, password], (err, result) => {
            if (err) {
                res.status(500).json({ message: err.message });
            } else {
                if (result.length > 0) {
                    res.status(200).json({ message: "Login efetuado com sucesso!" });
                } else {
                    res.status(401).json({ message: "Usuário ou senha inválidos!" });
                }
            }
        })
    }

}

module.exports = AuthController;