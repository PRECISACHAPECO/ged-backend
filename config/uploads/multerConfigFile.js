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

const configureMulterMiddleware = async (req, res, next, unidadeID, pathDestination) => {
    const maxSize = await getFileMaxSize(unidadeID);

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
            fileSize: maxSize * 1024 * 1024
        }
    });

    // Use um middleware de tratamento de erros do Multer
    upload.single('file')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            //? Valida tamanho do arquivo
            if (err.code === 'LIMIT_FILE_SIZE') {
                const maxSize = await getFileMaxSize(unidadeID);
                return res.status(400).send({ message: `O arquivo enviado é muito grande. Tamanho máximo permitido: ${maxSize}MB` });
            }
        } else {
            const allowedUnityExtensions = await getExtensions(unidadeID);
            //? Não há extensões permitidas nesta unidade
            if (!allowedUnityExtensions.length) {
                return res.status(400).send({ message: 'Não há nenhuma extensão de arquivo configurada para esta unidade!' });
            }
            //? Valida extensões 
            const isValidExtension = allowedUnityExtensions.some(ext => req.file.mimetype.startsWith(ext.mimetype));
            if (!isValidExtension) {
                return res.status(400).send({ message: 'Extensão não permitida (apenas: ' + allowedUnityExtensions.map(ext => ext.nome).join(', ') + ')' });
            }
        }

        //* Se não houver erro, avance para o próximo middleware
        next();
    });
};

module.exports = { configureMulterMiddleware }