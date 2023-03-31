const db = require('../../config/db');

// ** JWT import
const jwt = require('jsonwebtoken');

// ! These two secrets should be in .env file and not in any other file
const jwtConfig = {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
    expirationTime: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
    refreshTokenSecret: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
}

class AuthController {
    login(req, res) {
        const { email, password } = req.body;

        let error = {
            email: ['Algo está errado!!']
        }

        db.query("SELECT * FROM usuario WHERE email = ? AND senha = ?", [email, password], (err, result) => {
            if (err) { res.status(500).json({ message: err.message }); }
            // LOGADO COM SUCESSO
            if (result.length > 0) {
                const accessToken = jwt.sign({ id: result[0]['usuarioID'] }, jwtConfig.secret, { expiresIn: jwtConfig.expirationTime })
                const response = {
                    accessToken,
                    userData: { ...result[0], senha: undefined }
                }

                res.status(200).json(response);
            }
            // ERRO AO FAZER LOGIN
            else {
                error = {
                    email: ['E-mail ou senha inválidos!']
                }

                res.status(400).json(error);
            }
        })
    }
}

module.exports = AuthController;