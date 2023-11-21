const db = require('./db');

const executeLog = async (nome, usuarioID, unidadeID, req) => {


    try {
        // Simule o cabeçalho x-forwarded-for para ambiente local
        const ip = (req && req.headers && req.headers['x-forwarded-for']) || (req && req.connection && req.connection.remoteAddress) || 'localhost';

        // Construa a query de inserção na tabela de log
        const sqlInsertLog = 'INSERT INTO log (nome, usuarioID, unidadeID, dataHora, ip) VALUES (?, ?, ?, ?, ?)';

        const [results] = await db.promise().query(sqlInsertLog, [nome, usuarioID, unidadeID, new Date(), ip]);
        const id = results.insertId
        return id

    } catch (error) {
        console.error('Erro ao inserir log no banco de dados:', error);
    }

}


const executeQuery = async (sql, params, operation, tableName, uniqueColumnName, id, logID) => {
    // console.log("🚀 ~ executeQuery: sql, params, operation, tableName, uniqueColum   nName, id, logID:", sql, params, operation, tableName, uniqueColumnName, id, logID)


    const sqlSelect = `SELECT * FROM ${tableName} WHERE ${uniqueColumnName} = ?`;

    try {
        // Antes de executar a consulta, obtenha os dados atuais da tabela (antes da operação)
        const [rowsBefore] = await db.promise().query(sqlSelect, [id]);
        const beforeData = rowsBefore;

        // Execute a consulta real (insert, update ou delete)
        const [results] = await db.promise().query(sql, params);
        if (operation == 'insert') id = results.insertId

        console.log('CONSULTA: ', sqlSelect, id)

        // Após a execução da consulta, obtenha os dados atualizados da tabela (depois da operação)
        const [rowsAfter] = await db.promise().query(sqlSelect, [id]);
        const afterData = rowsAfter;

        const changeData = getChangedData(beforeData, afterData, operation, uniqueColumnName)

        // Registre os detalhes na tabela de log
        logDatabaseOperation(operation, tableName, changeData, logID);

        return id;
    } catch (err) {
        console.error('Error executing query:', err);
    }
};

const getChangedData = (beforeData, afterData, operation, uniqueColumnName) => {
    switch (operation) {
        case 'insert':
            return afterData[0]
            break
        case 'update':

            const changedData = {};

            for (const key in afterData[0]) {
                if (beforeData[0][key] != afterData[0][key]) {
                    changedData[key] = {
                        alterado: true,
                        antes: beforeData[0][key],
                        depois: afterData[0][key],
                    };
                } else {
                    changedData[key] = beforeData[0][key]
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

const logDatabaseOperation = async (operation, tableName, changeData, logID) => {
    try {
        // Construa a query de inserção na tabela de log
        const sqlInsertLog = 'INSERT INTO log_script (logID, operacao, tabela, alteracao) VALUES (?, ?, ?, ?)';

        await db.promise().query(sqlInsertLog, [logID, operation, tableName, JSON.stringify(changeData)]);

    } catch (error) {
        console.error('Erro ao inserir log no banco de dados:', error);
    }
};



module.exports = logDatabaseOperation;






module.exports = { executeQuery, executeLog };
