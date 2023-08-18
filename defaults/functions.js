const db = require('../config/db');
require('dotenv/config')

const addFormStatusMovimentation = async (parFormularioID, id, usuarioID, unidadeID, papelID, statusAnterior, statusAtual, observacao) => {

    if (parFormularioID && id && usuarioID && unidadeID && papelID && statusAnterior && statusAtual) {
        const sql = `
        INSERT INTO 
        movimentacaoformulario (parFormularioID, id, usuarioID, unidadeID, papelID, dataHora, statusAnterior, statusAtual, observacao) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        const [result] = await db.promise().query(sql, [
            parFormularioID,
            id,
            usuarioID,
            unidadeID,
            papelID,
            new Date(),
            statusAnterior,
            statusAtual,
            observacao ?? ''
        ])

        if (result.length === 0) { return false; }

        return true;
    }

    return false;
}

//* Função verifica na tabela de parametrizações do formulário e ve se objeto se referencia ao campo tabela, se sim, insere "ID" no final da coluna a ser atualizada no BD
const formatFieldsToTable = async (table, fields) => {
    let dataHeader = {}
    //? Usar Promise.all para aguardar a conclusão de todas as consultas
    await Promise.all(fields.map(async (field) => {
        const sql = `SELECT nomeColuna FROM ${table} WHERE tabela = "${field.tabela}" `;
        const [result] = await db.promise().query(sql);
        if (result.length > 0) {
            dataHeader[field.nomeColuna] = field[field.tabela]?.id > 0 ? field[field.tabela].id : 0;
        } else {
            dataHeader[field.nomeColuna] = field[field.nomeColuna] ? field[field.nomeColuna] : null
        }
    }));
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