const db = require('../config/db');
const executeQuery = require('./executeQuery');

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
            WHERE p.rota = m.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}
            LIMIT 1), 0) AS ler,
            
            COALESCE((SELECT p.inserir
            FROM permissao AS p 
            WHERE p.rota = m.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}
            LIMIT 1), 0) AS inserir,

            COALESCE((SELECT p.editar
            FROM permissao AS p 
            WHERE p.rota = m.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}
            LIMIT 1), 0) AS editar, 

            COALESCE((SELECT p.excluir
            FROM permissao AS p 
            WHERE p.rota = m.rota AND p.papelID = ${papelID} AND p.usuarioID = ${usuarioID} AND p.unidadeID = ${unidadeID}
            LIMIT 1), 0) AS excluir
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

const hasPending = async (id, arrPending) => {
    if (!arrPending) {
        // Se arrPending é nulo, você pode retornar uma Promise rejeitada com uma mensagem de erro
        return Promise.reject('Erro hasPending: parâmetro arrPending é nulo');
    }

    const promises = arrPending.map(async (entry) => {
        const { table, column } = entry;
        const columnPromises = column.map((columnName) => {
            return new Promise((resolve, reject) => {
                db.query(`SELECT * FROM ${table} WHERE ${columnName} = ?`, [id], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.length > 0);
                    }
                });
            });
        });

        return Promise.all(columnPromises).then((results) => {
            return results.some((hasPending) => hasPending);
        });
    });

    return Promise.all(promises).then((results) => {
        return results.some((hasPending) => hasPending);
    });
};

const hasConflict = async ({ columns, values, table, id }) => {
    if (columns && values && table) {
        //* Monta query dinamica com colunas e valores passados no array do parametro
        let queryConditions = ``
        if (id && id > 0) {
            queryConditions += ` AND ${columns[0]} <> ${id}`
            columns.map((column, index) => {
                if (index > 0) {
                    queryConditions += ` AND ${column} = "${values[index]}"`
                }
            })
        } else {
            columns.map((column, index) => {
                queryConditions += ` AND ${column} = "${values[index]}"`
            })
        }

        //* Monta consulta, se retornar algo, possui conflito
        const sql = `
        SELECT ${columns.join(', ')} 
        FROM ${table}
        WHERE 1 = 1${queryConditions}`;
        const [result] = await db.promise().query(sql);

        return result.length > 0 ? true : false
    }
    return false;
};

function gerarSenha() {
    const letrasMaiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';

    // Gere um caractere aleatório de cada categoria
    const letraMaiuscula = letrasMaiusculas[Math.floor(Math.random() * letrasMaiusculas.length)];
    const letraMinuscula = letrasMinusculas[Math.floor(Math.random() * letrasMinusculas.length)];
    const letraMinuscula2 = letrasMinusculas[Math.floor(Math.random() * letrasMinusculas.length)];
    const numero = numeros[Math.floor(Math.random() * numeros.length)];

    // Combine os caracteres gerados em uma senha
    const senha = `${letraMaiuscula}${letraMinuscula}${letraMinuscula2}${numero}`;

    return senha;
}

function gerarSenhaCaracteresIniciais(value, numCaracteres) {
    const numeros = value.replace(/[^0-9]/g, '')
    const senha = numeros.substring(0, numCaracteres)
    return senha
}

const removeSpecialCharts = (str) => {
    let newStr = ''
    const arr = str.split(' ')

    arr.map((item, index) => {
        let onlyLetters = ''
        onlyLetters = item.replace(/Ã£/g, 'a')
        onlyLetters = onlyLetters.replace(/Ã¡/g, 'a')
        onlyLetters = onlyLetters.replace(/Ã¢/g, 'a')
        onlyLetters = onlyLetters.replace(/Ãª/g, 'e')
        onlyLetters = onlyLetters.replace(/Ã©/g, 'e')
        onlyLetters = onlyLetters.replace(/Ã­/g, 'i')
        onlyLetters = onlyLetters.replace(/Ã³/g, 'o')
        onlyLetters = onlyLetters.replace(/Ã´/g, 'o')
        onlyLetters = onlyLetters.replace(/Ãµ/g, 'o')
        onlyLetters = onlyLetters.replace(/Ãº/g, 'u')
        onlyLetters = onlyLetters.replace(/Ã¼/g, 'u')
        onlyLetters = onlyLetters.replace(/Ã§/g, 'c')
        onlyLetters = onlyLetters.replace(/Ã±/g, 'n')
        onlyLetters = onlyLetters.replace(/Ã/g, 'A')
        onlyLetters = onlyLetters.replace(/Ã/g, 'A')
        onlyLetters = onlyLetters.replace(/Ã/g, 'A')
        onlyLetters = onlyLetters.replace(/Ã/g, 'E')
        onlyLetters = onlyLetters.replace(/Ã/g, 'I')
        onlyLetters = onlyLetters.replace(/Ã/g, 'O')
        onlyLetters = onlyLetters.replace(/Ã/g, 'O')
        onlyLetters = onlyLetters.replace(/Ã/g, 'O')
        onlyLetters = onlyLetters.replace(/Ã/g, 'U')
        onlyLetters = onlyLetters.replace(/Ã/g, 'U')
        onlyLetters = onlyLetters.replace(/Ã/g, 'C')
        onlyLetters = onlyLetters.replace(/Ã/g, 'N')
        onlyLetters = onlyLetters.replace(/Ã/g, 'E')
        onlyLetters = onlyLetters.replace(/Ã/g, 'I')
        onlyLetters = onlyLetters.replace(/Ã/g, 'O')
        onlyLetters = onlyLetters.replace(/Ã/g, 'O')
        onlyLetters = onlyLetters.replace(/Ã/g, 'O')
        // separa cada palavra com _
        newStr += index === 0 ? onlyLetters : `_${onlyLetters}`
    })

    console.log("🚀 ~ removeSpecialCharts:", newStr)
    return newStr ?? 'undefined...'
}

const deleteItem = async (id, table, column, res) => {
    for (const item of table) {
        // const [result] = await db.promise().query(`DELETE FROM ${item} WHERE ${column} = ?`, [id])
        const sqlDelete = `DELETE FROM ${item} WHERE ${column} = ?`
        executeQuery(sqlDelete, [id], 'delete', item, column, id)
    }
    return res.json({})
}


const criptoMd5 = (senha) => {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(senha).digest('hex');
    return hash;
}

const onlyNumbers = (string) => {
    return string.replace(/[^0-9]/g, '');
}

module.exports = { hasPending, deleteItem, getMenu, getMenuPermissions, criptoMd5, onlyNumbers, hasConflict, gerarSenha, gerarSenhaCaracteresIniciais, removeSpecialCharts };