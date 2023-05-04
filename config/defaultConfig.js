const db = require('../config/db');

const getMenu = async (papelID) => {
    const menu = []
    const sqlDivisor = `SELECT * FROM divisor WHERE papelID = ${papelID} AND status = 1 ORDER BY ordem ASC`;
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

    return menu;
}

const getMenuPermissions = async (papelID, usuarioID, unidadeID) => {
    const menu = []
    const sqlDivisor = `SELECT * FROM divisor WHERE papelID = ${papelID} AND status = 1 ORDER BY ordem ASC`;
    const [resultDivisor] = await db.promise().query(sqlDivisor);

    for (const rotaDivisor of resultDivisor) {
        const sqlMenu = `
        SELECT m.*, 
            COALESCE((SELECT p.ler
            FROM permissao AS p 
            WHERE p.rota = m.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}), 0) AS ler,
            
            COALESCE((SELECT p.inserir
            FROM permissao AS p 
            WHERE p.rota = m.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}), 0) AS inserir,

            COALESCE((SELECT p.editar
            FROM permissao AS p 
            WHERE p.rota = m.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}), 0) AS editar, 

            COALESCE((SELECT p.excluir
            FROM permissao AS p 
            WHERE p.rota = m.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}), 0) AS excluir
        FROM menu AS m
        WHERE m.divisorID = ${rotaDivisor.divisorID} AND m.status = 1 
        ORDER BY m.ordem ASC;`;
        const [resultMenu] = await db.promise().query(sqlMenu);
        for (const rotaMenu of resultMenu) {
            if (rotaMenu.rota === null) {
                const sqlSubmenu = `
                SELECT s.*, 
                    COALESCE((SELECT p.ler
                    FROM permissao AS p 
                    WHERE p.rota = s.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}), 0) AS ler,

                    COALESCE((SELECT p.inserir
                    FROM permissao AS p 
                    WHERE p.rota = s.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}), 0) AS inserir,

                    COALESCE((SELECT p.editar
                    FROM permissao AS p 
                    WHERE p.rota = s.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}), 0) AS editar,

                    COALESCE((SELECT p.excluir
                    FROM permissao AS p 
                    WHERE p.rota = s.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}), 0) AS excluir
                FROM submenu AS s 
                WHERE s.menuID = ${rotaMenu.menuID} AND s.status = 1 
                ORDER BY s.ordem ASC`;
                const [resultSubmenu] = await db.promise().query(sqlSubmenu);
                if (resultSubmenu) {
                    rotaMenu.submenu = resultSubmenu;
                }
            }
        }

        rotaDivisor.menu = resultMenu;

        menu.push(rotaDivisor);
    }

    return menu;
}

const hasPending = (id, column, tables) => {
    if (!tables) {
        // Se tables é nulo, você pode retornar uma Promise rejeitada com uma mensagem de erro
        console.log('chegou null')
        return Promise.resolve('pp');
    }
    const promises = tables.map((table) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM ${table} WHERE ${column} = ?`, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.length > 0);
                }
            });
        });
    });

    return Promise.all(promises).then((results) => {
        return results.some((hasPending) => hasPending);
    });
};

const deleteItem = (id, table, column, res) => {
    db.query(`DELETE FROM ${table} WHERE ${column} = ?`, [id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json(err);
        } else {
            res.status(200).json(result);
        }
    });
}

module.exports = { hasPending, deleteItem, getMenu, getMenuPermissions };