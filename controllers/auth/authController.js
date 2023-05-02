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
                    unidades: [{ unidadeID: result[0].unidadeID, nomeFantasia: result[0].nomeFantasia }]
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

    async getAvailableRoutes(req, res) {
        const functionName = req.headers['function-name'];
        const { usuarioID, unidadeID } = req.query;

        // Menu e Routes
        switch (functionName) {
            case 'getMenu':
                const menu = []

                const sqlDivisor = `SELECT * FROM divisor WHERE status = 1 ORDER BY ordem ASC`;
                const [resultDivisor] = await db.promise().query(sqlDivisor);

                for (const rotaDivisor of resultDivisor) {
                    const sqlMenu = `SELECT * FROM menu WHERE divisorID = ? AND status = 1 ORDER BY ordem ASC`;
                    const [resultMenu] = await db.promise().query(sqlMenu, [rotaDivisor.divisorID]);
                    for (const rotaMenu of resultMenu) {
                        if (rotaMenu.rota === null) {
                            const sqlSubmenu = `SELECT * FROM submenu WHERE menuID = ? AND status = 1 ORDER BY ordem ASC`;
                            const [resultSubmenu] = await db.promise().query(sqlSubmenu, [rotaMenu.menuID]);
                            if (resultSubmenu) {
                                rotaMenu.submenu = resultSubmenu;
                            }
                        }
                    }

                    rotaDivisor.menu = resultMenu;

                    menu.push(rotaDivisor);
                }

                res.status(200).json(menu);
                break;

            case 'getRoutes':
                let sqlRoutes = ``
                const admin = req.query.admin;
                if (admin == 1) {
                    // Usuário admin, permissão para todas as rotas
                    sqlRoutes = `
                    SELECT IF(m.rota <> '', m.rota, s.rota) AS rota, 1 AS ler, 1 AS inserir, 1 AS editar, 1 AS excluir
                    FROM menu AS m  
                        LEFT JOIN submenu AS s ON (m.menuID = s.menuID)
                    WHERE m.status = 1 OR s.status = 1`
                } else {
                    // Não é admin, busca permissões da tabela permissao
                    sqlRoutes = `
                    SELECT rota, ler, inserir, editar, excluir
                    FROM permissao
                    WHERE usuarioID = ${usuarioID} AND unidadeID = ${unidadeID}`;
                }

                db.query(sqlRoutes, (err, result) => {
                    if (err) { res.status(500).json({ message: err.message }); }

                    result.forEach(rota => {
                        rota.ler = rota.ler === 1 ? true : false;
                        rota.inserir = rota.inserir === 1 ? true : false;
                        rota.editar = rota.editar === 1 ? true : false;
                        rota.excluir = rota.excluir === 1 ? true : false;
                    })

                    res.status(200).json(result);
                })

                break;
        }
    }
}

module.exports = AuthController;