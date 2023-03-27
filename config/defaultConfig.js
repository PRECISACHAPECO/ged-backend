const db = require('../config/db');

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

module.exports = { hasPending, deleteItem };