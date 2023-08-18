const db = require('../../../config/db');
const multer = require('multer');
const path = require('path');
const { Router } = require('express');
const UsuarioController = require('../../../controllers/configuracoes/usuario/usuarioController');

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();
const route = '/usuario';

usuarioRoutes.get(`${route}`, usuarioController.getList);
usuarioRoutes.post(`${route}/getData/:id`, usuarioController.getData);
usuarioRoutes.post(`${route}/updateData/:id`, usuarioController.updateData);

usuarioRoutes.delete(`${route}/photo-profile/:id`, usuarioController.handleDeleteImage);
usuarioRoutes.delete(`${route}/:id`, usuarioController.deleteData);
usuarioRoutes.post(`${route}/new/insertData`, usuarioController.insertData);

//! Arquivos com multer aqui
const getExtensions = async () => {
    const sql = `
    SELECT * 
    FROM unidade_extensao AS ue 
        JOIN extensao AS e ON (ue.extensaoID = e.extensaoID)
    WHERE ue.unidadeID = ?`
    const [result] = await db.promise().query(sql, [1])
    return result
}

// Multer: tratar diretorio pra salvar arquivos, extensões permitidas e tamanho máximo do arquivo, após isso, se estiver tudo ok, enviar pra usuarioController.updatePhotoProfile
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const allowedUnityExtensions = await getExtensions()
        const isValidExtension = allowedUnityExtensions.some(ext => file.mimetype.startsWith(ext.mimetype));
        if (isValidExtension) {
            cb(null, 'uploads/profile')
        } else {
            cb(new Error('Extensão não permitida (Apenas: ' + allowedUnityExtensions.map(ext => ext.nome).join(', ') + ')'))
        }
    },
    filename: (req, file, cb) => {
        // const extensao = path.extname(file.originalname).toLowerCase()
        const nomeArquivo = `${Date.now()}-${file.originalname}`
        cb(null, nomeArquivo)
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    }
})

//? middleware pra tratar erros do multer, como tamanho máximo do arquivo e extensão não permitida
const uploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        // console.log("🚀 ~ err:", err)
        // if (err instanceof multer.MulterError) {
        //     if (err.code === 'LIMIT_FILE_SIZE') {
        //         console.log('erro tamanho')
        //         return res.status(400).json({ error: 'Tamanho máximo do arquivo excedido.' });
        //     }
        //     if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        //         console.log('erro extensaooo')
        //         return res.status(400).json({ error: 'Tipo de arquivo não permitido.' });
        //     }
        // }
        if (err) {
            console.log('erro nao sei: ', err.message)
            return res.status(401).json({ message: err.message });
        }
        return next();
    });
}

usuarioRoutes.post(`${route}/photo-profile/:id`, uploadMiddleware, usuarioController.updatePhotoProfile)
// usuarioRoutes.post(`${route}/photo-profile/:id`, upload.single('file'), usuarioController.updatePhotoProfile)
//! Arquivos com multer aqui

module.exports = usuarioRoutes;
