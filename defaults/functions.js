const db = require('../config/db');
require('dotenv/config')

const addFormStatusMovimentation = async (parFormularioID, id, usuarioID, unidadeID, papelID, statusAnterior, statusAtual) => {

    if (parFormularioID && id && usuarioID && unidadeID && papelID && statusAnterior && statusAtual) {
        const sql = `
        INSERT INTO 
        movimentacaoformulario (parFormularioID, id, usuarioID, unidadeID, papelID, dataHora, statusAnterior, statusAtual) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        const [result] = await db.promise().query(sql, [
            parFormularioID,
            id,
            usuarioID,
            unidadeID,
            papelID,
            new Date(),
            statusAnterior,
            statusAtual
        ])

        if (result.length === 0) { return false; }

        return true;
    }

    return false;
}

//* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
const formatFieldsToTable = async (table, fields) => {
    let dataHeader = {}
    for (const columnName in fields) {
        const sql = `SELECT nomeColuna FROM ${table} WHERE tabela = "${columnName}" `
        const [result] = await db.promise().query(sql)
        if (result.length > 0) {
            dataHeader[result[0]['nomeColuna']] = fields[columnName]?.id > 0 ? fields[columnName].id : 0
        } else {
            dataHeader[columnName] = fields[columnName] ? fields[columnName] : null
        }
    }
    return dataHeader;
}

const hasUnidadeID = async (table) => {
    const sql = `
    SELECT *
    FROM information_schema.columns
    WHERE table_schema = "${process.env.DB_DATABASE}" AND table_name = "${table}" AND column_name = "unidadeID" `
    const [result] = await db.promise().query(sql)

    return result.length === 0 ? false : true;
}

module.exports = { addFormStatusMovimentation, formatFieldsToTable, hasUnidadeID };