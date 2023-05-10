const db = require('../../config/db');
const { getMenu } = require('../../config/defaultConfig');

// ** JWT import
const jwt = require('jsonwebtoken');

// ! These two secrets should be in .env file and not in any other file
const jwtConfig = {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
    expirationTime: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
    refreshTokenSecret: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
}

class AuthController {

    //* Login do fornecedor (CNPJ)
    loginFornecedor(req, res) {
        const { cnpj, password } = req.body;

        const sql = `
        SELECT u.*, un.unidadeID, un.nomeFantasia, p.papelID, p.nome as papel
        FROM usuario AS u 
            LEFT JOIN usuario_unidade AS uu ON (u.usuarioID = uu.usuarioID)
            LEFT JOIN unidade AS un ON (uu.unidadeID = un.unidadeID)
            LEFT JOIN papel AS p ON (uu.papelID = p.papelID)
        WHERE u.cnpj = ? AND u.senha = ? AND uu.status = 1 
        AND p.papelID = 2
        ORDER BY un.nomeFantasia ASC`;

        db.query(sql, [cnpj, password], (err, result) => {
            if (err) { res.status(409).json({ message: err.message }); }

            const accessToken = jwt.sign({ id: result[0]['usuarioID'] }, jwtConfig.secret, { expiresIn: jwtConfig.expirationTime })

            const response = {
                accessToken,
                userData: { ...result[0], senha: undefined },
                unidades: [{ unidadeID: result[0].unidadeID, nomeFantasia: result[0].nomeFantasia, papelID: result[0].papelID, papel: result[0].papel }]
            }
            res.status(200).json(response);

        })
    }

    async getAvailableRoutes(req, res) {
        const functionName = req.headers['function-name'];
        const { usuarioID, unidadeID, papelID } = req.query;

        // Menu e Routes
        switch (functionName) {
            case 'getMenu':
                const menu = await getMenu(papelID)

                res.status(200).json(menu);
                break;

            case 'getRoutes':
                let sqlRoutes = `
                SELECT 
                    IF(b.rota <> '', b.rota, c.rota) AS rota, 1 AS ler, 1 AS inserir, 1 AS editar, 1 AS excluir
                FROM divisor a 
                    LEFT JOIN menu b on (a.divisorID = b.divisorID)
                    LEFT JOIN submenu c on (b.menuID = c.menuID)
                WHERE (b.status = 1 OR c.status = 1) AND a.papelID = ${papelID}`;
                console.log("🚀 ~ getAvailableRoutes:", sqlRoutes)

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

    //* Cadastro do fornecedor
    async registroFornecedor(req, res) {
        const functionName = req.headers['function-name'];

        switch (functionName) {

            //? Função que valida se o cnpj já existe no banco de dados
            case 'handleGetCnpj':
                const { cnpj } = req.body;

                const resultUser = await hasUser(cnpj) //? Verificar se já existe esse usuário cadastrado
                const resultUnity = await hasUnityRole(cnpj) //? Verificar se já existe essa unidade vinculada como fornecedor

                //  Retornar um array vazio se não encontrar o cnpj no banco de dados
                if (resultUser.length === 0 && resultUnity.length === 0) {
                    return res.status(200).json([]);
                } else {
                    return res.status(200).json(resultUnity.length > 0 ? resultUnity : resultUser);
                }
                break;

            //? Função que salva o cadastro do fornecedor no banco de dados
            case 'handleSaveFornecedor':
                const data = req.body.data.usuario.fields

                //? Verificar se o CNPJ já existe nq tabela de usuário
                const resultUserSave = await hasUser(data.cnpj)
                if (resultUserSave.length > 0) {
                    return res.status(201).json({ message: 'CNPJ já cadastrado no banco de dados' });
                }

                //? Verificar se o CNPJ já existe nq tabela de unidade
                const resultUnitySave = await hasUnityRole(data.cnpj)
                if (resultUnitySave.length > 0) {
                    return res.status(201).json({ message: 'CNPJ já cadastrado no banco de dados' });
                }

                //? Salvar o usuário no banco de dados
                const sqlInsertUsuario = `
                INSERT INTO usuario (nome, cnpj, email, senha, admin) VALUES (?, ?, ?, ?, ?)`;
                const resultInsertUsuario = await db.promise().query(sqlInsertUsuario, [data.nomeFantasia, data.cnpj, data.email, data.senha, 0]);
                const usuarioID = resultInsertUsuario[0].insertId;

                //? Salvar a unidade no banco de dados
                const sqlInsertUnidade = `
                INSERT INTO unidade (cnpj, nomeFantasia, razaoSocial, email, telefone1, cep, logradouro, numero, complemento, bairro, cidade, uf, dataCadastro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const resultInsertUnidade = await db.promise().query(sqlInsertUnidade, [data.cnpj, data.nomeFantasia, data.razaoSocial, data.email, data.telefone, data.cep, data.logradouro, data.numero, data.complemento, data.bairro, data.cidade, data.uf, new Date()]);
                const unidadeID = resultInsertUnidade[0].insertId;

                //? Salvar na tabela de usuário_unidade
                const sqlInsertUsuarioUnidade = `
                INSERT INTO usuario_unidade (usuarioID, unidadeID, papelID, status) VALUES (?, ?, ?, ?)`;
                const resultInsertUsuarioUnidade = await db.promise().query(sqlInsertUsuarioUnidade, [usuarioID, unidadeID, 2, 1]);

                res.status(200).json({ message: 'Fornecedor cadastrado com sucesso!' });
                break;
        }
    }
}

async function hasUnityRole(cnpj) {
    const sql = ` 
    SELECT a.*, b.*,
        (SELECT COUNT(*) FROM usuario_unidade WHERE unidadeID = a.unidadeID AND papelID = 2) AS existsFornecedor
    FROM unidade AS a 
        JOIN usuario_unidade AS b ON (a.unidadeID = b.unidadeID)
    WHERE a.cnpj = ? `;
    const [result] = await db.promise().query(sql, [cnpj]);
    return result;
}

async function hasUser(cnpj) {
    const sql = ` 
    SELECT * 
    FROM usuario AS a 
    WHERE a.cnpj = ?`;
    const [result] = await db.promise().query(sql, [cnpj]);
    return result;
}

module.exports = AuthController;