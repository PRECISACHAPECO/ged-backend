const db = require('../db');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');


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

const timeNow = Date.now();
const defineFileName = (originalName) => {
    return `${timeNow}-${originalName}`
}


const configureMulterMiddleware = async (req, res, next, unidadeID, pathDestination) => {
    const maxSize = await getFileMaxSize(unidadeID);

    const customStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, pathDestination);
        },
        filename: function (req, file, cb) {
            cb(null, defineFileName(`original-${file.originalname}`));
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

            // Se for imagem, redimensione
            if (req.file.mimetype.startsWith('image')) {

                // Use o Sharp para redimensionar a imagem

                sharp(req.file.path)
                    .resize({ width: 300, height: 200 }) // Defina as dimensões desejadas
                    .toFile(path.join(pathDestination, defineFileName(req.file.originalname)), (err, info) => {
                        if (err) {
                            return res.status(400).send({ message: 'Erro ao redimensionar a imagem!' });
                        }
                        // res.send({ message: 'Imagem redimensionada com sucesso!' });
                    });
            }
        }

        //* Se não houver erro, avance para o próximo middleware
        next();
    });
};

module.exports = { configureMulterMiddleware }