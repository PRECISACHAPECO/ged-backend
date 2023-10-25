const db = require('../db')
const multerFiles = require('./multerFiles')

const getExtensions = async (usuarioID, unidadeID) => {
    //? Verifica papel, se for fornecedor, habilita todas as extensoes
    const sqlPapel = `
    SELECT papelID
    FROM usuario_unidade
    WHERE usuarioID = ? AND unidadeID = ?`
    const [resultPapel] = await db.promise().query(sqlPapel, [usuarioID, unidadeID])

    if (resultPapel[0].papelID == 2) {
        const sql = `SELECT * FROM extensao`
        const [result] = await db.promise().query(sql)
        return result
    } else {
        const sql = `
        SELECT * 
        FROM unidade_extensao AS ue 
            JOIN extensao AS e ON (ue.extensaoID = e.extensaoID)
        WHERE ue.unidadeID = ?`
        const [result] = await db.promise().query(sql, [unidadeID])
        return result
    }
}

const getFileMaxSize = async (unidadeID) => {
    const sql = `
    SELECT anexosTamanhoMaximo
    FROM unidade 
    WHERE unidadeID = ?`
    const [result] = await db.promise().query(sql, [unidadeID])
    return result[0].anexosTamanhoMaximo ?? 5
}

const configureMulterMiddleware = async (req, res, next, usuarioID, unidadeID, pathDestination) => {
    //? Parâmetros pro multer
    const maxSize = await getFileMaxSize(unidadeID)
    const allowedUnityExtensions = await getExtensions(usuarioID, unidadeID)
    const maxOriginalSize = 100 //? Imagem até 100MB (antes de redimensionar)
    const imageMaxDimensionToResize = 1024
    multerFiles(req, res, next, usuarioID, pathDestination, maxOriginalSize, maxSize, allowedUnityExtensions, imageMaxDimensionToResize)
}

module.exports = { configureMulterMiddleware }