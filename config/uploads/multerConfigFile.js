const db = require('../db');
const multer = require('multer');
const path = require('path');

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

// Middleware para configurar o multer com o tamanho máximo do arquivo
const configureMulterMiddleware = async (req, res, next, unidadeID, pathDestination) => {
    const size = await getFileMaxSize(unidadeID);

    const customStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, pathDestination);
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    const upload = multer({
        storage: customStorage,
        limits: {
            fileSize: size * 1024 * 1024
        },
        fileFilter: async (req, file, cb) => {
            const allowedUnityExtensions = await getExtensions(unidadeID)
            const isValidExtension = allowedUnityExtensions.some(ext => file.mimetype.startsWith(ext.mimetype));
            if (isValidExtension) {
                cb(null, true);
            } else {
                const error = new Error('Extensão não permitida (apenas: ' + allowedUnityExtensions.map(ext => ext.nome).join(', ') + ')');
                error.code = 'EXTENSION';
                return cb(error);
            }
        }
    });
    req.upload = upload; // Anexa o middleware multer ao objeto de solicitação para uso posterior

    //? Valida extensão e tamanho do arquivo
    validateFileMiddleware(req, res, next);
};

const validateFileMiddleware = (req, res, next) => {
    req.upload.single('file')(req, res, function (err) {
        if (err) {
            if (err.code === 'EXTENSION') {
                return res.status(400).send({ message: err.message });
            } else if (err.code === 'LIMIT_FILE_SIZE') {
                const { fileSize } = req.upload.limits
                const size = fileSize / 1024 / 1024
                return res.status(400).send({ message: `O arquivo enviado é muito grande. Tamanho máximo permitido: ${size}MB` });
            }
        }
        next();
    });
}

module.exports = { configureMulterMiddleware }