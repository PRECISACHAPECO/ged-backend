const db = require('./db');


const executeQuery = async (sql, params, operation, tableName, uniqueColumnName, id, usuarioID, unidadeID) => {

    const sqlSelect = `SELECT * FROM ${tableName} WHERE ${uniqueColumnName} = ?`;

    try {
        // Antes de executar a consulta, obtenha os dados atuais da tabela (antes da operação)
        const [rowsBefore] = await db.promise().query(sqlSelect, [id]);
        const beforeData = rowsBefore;

        // Execute a consulta real (insert, update ou delete)
        const [results] = await db.promise().query(sql, params);
        if (operation == 'insert') id = results.insertId

        // Após a execução da consulta, obtenha os dados atualizados da tabela (depois da operação)
        const [rowsAfter] = await db.promise().query(sqlSelect, [id]);
        const afterData = rowsAfter;

        const changeData = getChangedData(beforeData, afterData, operation, uniqueColumnName)

        // Registre os detalhes na tabela de log
        logDatabaseOperation(operation, tableName, changeData, usuarioID, unidadeID);

        return id;
    } catch (err) {
        console.error('Error executing query:', err);
    }
};

const getChangedData = (beforeData, afterData, operation, uniqueColumnName) => {
    switch (operation) {
        case 'insert':
            console.log('Insert');
            return afterData[0]
            break
        case 'update':

            // Compare os dados antes e depois do update para encontrar as diferenças
            const changedData = {};

            for (const key in afterData[0]) {
                if (key == uniqueColumnName) {
                    changedData[key] = afterData[0][key]
                }
                else if (beforeData[0][key] !== afterData[0][key]) {
                    changedData[key] = {
                        antes: beforeData[0][key],
                        depois: afterData[0][key]
                    };
                }
            }

            return changedData

            break
        case 'delete':
            return beforeData[0]
            break

    }

    return false
}

const logDatabaseOperation = (operation, tableName, changeData, usuarioID, unidadeID) => {
    console.log("🚀 ~ operation, tableName, changeData, usuarioID, unidadeID:", operation, tableName, changeData, usuarioID, unidadeID)

};





module.exports = executeQuery;
