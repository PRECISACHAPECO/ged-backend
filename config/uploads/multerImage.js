
const multer = require('multer')
const path = require('path')
const sharp = require('sharp')

const defineFileName = (tempFolder, originalName, usuarioID) => {
    //? yyyymmdd-hms
    const dateTimeNow = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '-').split('.')[0].slice(0, 15)
    const fileName = `${dateTimeNow}-${usuarioID}-${originalName}`
    // obter diretorio da pasta temp em uploads/temp
    const tempPathFolder = `temp`
    return tempFolder ? `${tempPathFolder}/${fileName}` : `${fileName}`
}

const multerImage = async (req, res, next, usuarioID, pathDestination, maxOriginalSize, maxSize, allowedUnityExtensions, imageMaxDimensionToResize) => {
    const customStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, pathDestination)
        },
        filename: function (req, file, cb) {
            cb(null, defineFileName(true, file.originalname, usuarioID)) //? Grava imagem original na pasta temp
        }
    })

    const upload = multer({
        storage: customStorage,
        limits: {
            fileSize: maxOriginalSize * 1024 * 1024
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
            //! Valida tamanho do arquivo (antes de redimensionar)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send({ message: `O arquivo enviado é muito grande. Tamanho máximo permitido: ${maxOriginalSize}MB` })
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
            //? Redimensionar imagem
            console.log("🚀 ~ redimensiona imagem => usuarioID:", usuarioID)
            const fileName = defineFileName(false, req.file.originalname, usuarioID) //? Grava imagem redimensionada na pasta raiz            
            sharp(req.file.path)
                .resize({
                    width: imageMaxDimensionToResize,
                    height: imageMaxDimensionToResize
                }) // Defina as dimensões desejadas
                .toFile(path.join(pathDestination, fileName), (err, info) => {
                    if (err) {
                        return res.status(400).send({ message: 'Erro ao redimensionar a imagem!' })
                    }

                    //? Exclui todos os arquivos da pasta uploads/anexos/temp 
                    const fs = require('fs')
                    fs.readdirSync(path.join(pathDestination, 'temp')).forEach(file => {
                        fs.unlinkSync(path.join(pathDestination, 'temp', file))
                    })

                    //? Atualiza informações do arquivo para ser enviado pro middleware
                    req.file.filename = fileName
                    req.file.path = pathDestination + fileName
                    req.file.size = info.size //? Tamanho novo (redimensionado)
                    console.log(`📸 ~ Imagem redimensionada para ${(info.size / 1024 / 1024)}MB`)

                    //! Imagem redimensionada continua maior que o tamanho máximo permitido pela unidade
                    if (info.size > maxSize * 1024 * 1024) {
                        //! Exclui imagem redimensionada
                        fs.unlinkSync(path.join(pathDestination, fileName))

                        return res.status(400).send({ message: `O arquivo enviado é muito grande. Tamanho máximo permitido: ${maxSize}MB` })
                    } else {
                        //* Tudo certo, segue o fluxo
                        next()
                    }
                })
        }
    })
}

module.exports = multerImage;