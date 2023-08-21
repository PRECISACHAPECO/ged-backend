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


//* Upload de imagem com multer e mensagem de validação de arquivo maior que 5mb e extensão não permitida

const getExtensions = async () => {
    const sql = `
    SELECT * 
    FROM unidade_extensao AS ue 
        JOIN extensao AS e ON (ue.extensaoID = e.extensaoID)
    WHERE ue.unidadeID = ?`
    const [result] = await db.promise().query(sql, [1])
    return result
}

const getFileMaxSize = async () => {
    const sql = `
    SELECT anexosTamanhoMaximo
    FROM unidade 
    WHERE unidadeID = ?`
    const [result] = await db.promise().query(sql, [1])
    return result[0].anexosTamanhoMaximo ?? 5
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: async () => {
            const size = await getFileMaxSize()
            console.log("🚀 ~ size:", size)
            return size * 1024 * 1024
        }
    },

    fileFilter: async (req, file, cb) => {
        const allowedUnityExtensions = await getExtensions()
        const isValidExtension = allowedUnityExtensions.some(ext => file.mimetype.startsWith(ext.mimetype));
        console.log("🚀 ~ isValidExtension:", file.mimetype, isValidExtension)
        if (isValidExtension) {
            cb(null, true);
        } else {
            const error = new Error('Extensão não permitida (apenas: ' + allowedUnityExtensions.map(ext => ext.nome).join(', ') + ')');
            error.code = 'EXTENSION';
            return cb(error);
        }
    }
});

//? middleware para upload de imagem e mensagem de validação de arquivo maior que 5mb e extensão não permitida
usuarioRoutes.post(`${route}/photo-profile/:id`, upload.single('file'), usuarioController.updatePhotoProfile, (error, req, res, next) => {
    if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            const { fileSize } = upload.limits
            const size = fileSize / 1024 / 1024
            return res.status(400).send({ message: `O arquivo enviado é muito grande. Tamanho máximo permitido: ${size}MB` });
        } else if (error.code === 'EXTENSION') {
            return res.status(400).send({ message: error.message });
        }
    }
});

module.exports = usuarioRoutes;
