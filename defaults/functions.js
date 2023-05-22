const db = require('../config/db');

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

module.exports = { addFormStatusMovimentation };