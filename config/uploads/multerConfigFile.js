const db = require('../db')
const multer = require('multer')
const path = require('path')
const sharp = require('sharp')

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

const timeNow = Date.now()
const defineFileName = (tempFolder, originalName) => {
    const fileName = tempFolder ? `temp/${timeNow}-${originalName}` : `${timeNow}-${originalName}`
    return fileName
}

const configureMulterMiddleware = async (req, res, next, unidadeID, pathDestination, isImage) => {

    //* Imagem, grava original na pasta temp, redimensiona, valida tamanho máximo e depois apaga imagem original da pasta temp
    if (isImage === 'true') {
        console.log('IMAGEM')

        const maxOriginalSize = 100 //? Imagem até 100MB (antes de redimensionar)
        const maxSize = await getFileMaxSize(unidadeID)

        const customStorage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, pathDestination)
            },
            filename: function (req, file, cb) {
                cb(null, defineFileName(true, file.originalname)) //? Grava imagem orional na pasta temp
            }
        })

        const upload = multer({
            storage: customStorage,
            limits: {
                fileSize: maxOriginalSize * 1024 * 1024
            },
            fileFilter: async function (req, file, cb) {
                //? Valida a extensão do arquivo
                const allowedUnityExtensions = await getExtensions(unidadeID)
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
                console.log("🚀 ~ err.code:", err.code, err)
                //! Valida tamanho do arquivo (antes de redimensionar)
                if (err.code === 'LIMIT_FILE_SIZE') {
                    console.log('middle erro limite')
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
                const fileName = defineFileName(false, req.file.originalname) //? Grava imagem redimensionada na pasta raiz
                // Use o Sharp para redimensionar a imagem
                sharp(req.file.path)
                    .resize({
                        width: 1024,
                        height: 1024
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
                        console.log("🚀 ~ tamanho da imagem redimensionada:", info.size / 1024 / 1024)

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
    //* Não é imagem, valida tamanho e extensão e grava direto
    else {
        console.log('ARQUIVO NAO IMAGEM')
        const maxSize = await getFileMaxSize(unidadeID)

        const customStorage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, pathDestination)
            },
            filename: function (req, file, cb) {
                cb(null, defineFileName(false, file.originalname)) //? params: tempFolder, originalName                
            }
        })

        const upload = multer({
            storage: customStorage,
            limits: {
                fileSize: maxSize * 1024 * 1024
            },
            fileFilter: async function (req, file, cb) {
                //? Valida a extensão do arquivo
                const allowedUnityExtensions = await getExtensions(unidadeID)
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
                console.log("🚀 ~ err.code:", err.code, err)
                //? Valida tamanho do arquivo
                if (err.code === 'LIMIT_FILE_SIZE') {
                    console.log('middle erro limite')
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
}

module.exports = { configureMulterMiddleware }