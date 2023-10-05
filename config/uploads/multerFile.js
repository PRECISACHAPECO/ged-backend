
const multer = require('multer')

const defineFileName = (usuarioID, originalName) => {
    //? yyyymmdd-hms
    const dateTimeNow = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '-').split('.')[0].slice(0, 15)
    return `${dateTimeNow}-${usuarioID}-${originalName}`
}

const multerFile = async (req, res, next, usuarioID, pathDestination, maxSize, allowedUnityExtensions) => {
    const customStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, pathDestination)
        },
        filename: function (req, file, cb) {
            cb(null, defineFileName(usuarioID, file.originalname))
        }
    })

    const upload = multer({
        storage: customStorage,
        limits: {
            fileSize: maxSize * 1024 * 1024
        },
        fileFilter: async function (req, file, cb) {
            //? Valida a extensão do arquivo
            if (!allowedUnityExtensions.length) {
                return cb(new multer.MulterError('EMPTY_EXTENSION', 'Não há nenhuma extensão de arquivo configurada para esta unidade!'))
            } else {
                const isValidExtension = allowedUnityExtensions.some(ext => file.mimetype.startsWith(ext.mimetype))
                if (!isValidExtension) {
                    return cb(new multer.MulterError('EXTENSION', 'Extensão não permitida (apenas: ' + allowedUnityExtensions.map(ext => ext.nome).join(', ') + ')'))
                } else {
                    cb(null, true)
                }
            }
        }
    })

    // Use um middleware de tratamento de erros do Multer
    upload.single('file')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            //? Valida tamanho do arquivo
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send({ message: `O arquivo enviado é muito grande. Tamanho máximo permitido: ${maxSize}MB` })
            }
            //? Valida extensões permitidas
            else if (err.code === 'EMPTY_EXTENSION') {
                return res.status(400).send({ message: err.field })
            }
            //? Valida extensões permitidas
            else if (err.code === 'EXTENSION') {
                return res.status(400).send({ message: err.field })
            }
        } else {
            //* Tudo certo, segue o fluxo                          
            next()
        }
    })
}

module.exports = multerFile;