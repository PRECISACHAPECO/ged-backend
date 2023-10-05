const db = require('../db')
const multerFile = require('./multerFile')
const multerImage = require('./multerImage')

const getExtensions = async (unidadeID) => {
    const sql = `
    SELECT * 
    FROM unidade_extensao AS ue 
        JOIN extensao AS e ON (ue.extensaoID = e.extensaoID)
    WHERE ue.unidadeID = ?`
    const [result] = await db.promise().query(sql, [unidadeID])
    return result
}

const getFileMaxSize = async (unidadeID) => {
    const sql = `
    SELECT anexosTamanhoMaximo
    FROM unidade 
    WHERE unidadeID = ?`
    const [result] = await db.promise().query(sql, [unidadeID])
    return result[0].anexosTamanhoMaximo ?? 5
}

const configureMulterMiddleware = async (req, res, next, usuarioID, unidadeID, pathDestination, isImage) => {
    //? Parâmetros pro multer
    const maxSize = await getFileMaxSize(unidadeID)
    const allowedUnityExtensions = await getExtensions(unidadeID)
    const maxOriginalSize = 100 //? Imagem até 100MB (antes de redimensionar)
    const imageMaxDimensionToResize = 1024

    isImage === 'true' ?
        multerImage(req, res, next, usuarioID, pathDestination, maxOriginalSize, maxSize, allowedUnityExtensions, imageMaxDimensionToResize) :
        multerFile(req, res, next, usuarioID, pathDestination, maxSize, allowedUnityExtensions)
}

module.exports = { configureMulterMiddleware }