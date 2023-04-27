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
        const { cpf, password } = req.body;

        let error = {
            email: ['Algo está errado!!']
        }

        const sql = `
        SELECT u.*, un.unidadeID, un.nomeFantasia
        FROM usuario AS u 
            JOIN usuario_unidade AS uu ON (u.usuarioID = uu.usuarioID)
            JOIN unidade AS un ON (uu.unidadeID = un.unidadeID)
        WHERE u.cpf = ? AND u.senha = ? AND uu.status = 1
        ORDER BY un.nomeFantasia ASC`;

        db.query(sql, [cpf, password], (err, result) => {
            if (err) { res.status(500).json({ message: err.message }); }

            const accessToken = jwt.sign({ id: result[0]['usuarioID'] }, jwtConfig.secret, { expiresIn: jwtConfig.expirationTime })

            // +1 UNIDADE, SELECIONA UNIDADE ANTES DE LOGAR
            if (result.length > 1) {
                const response = {
                    accessToken,
                    userData: { ...result[0], senha: undefined },
                    unidades: result.map(unidade => ({ unidadeID: unidade.unidadeID, nomeFantasia: unidade.nomeFantasia }))
                }
                res.status(202).json(response);
            }

            // 1 UNIDADE, LOGA DIRETO
            else if (result.length === 1) {

                const response = {
                    accessToken,
                    userData: { ...result[0], senha: undefined },
                    unidades: { unidadeID: result[0].unidadeID, nomeFantasia: result[0].nomeFantasia }
                }
                res.status(200).json(response);
            }

            // ERRO AO FAZER LOGIN
            else {
                error = {
                    email: ['CPF ou senha inválidos!']
                }

                res.status(400).json(error);
            }
        })
    }
}

module.exports = AuthController;