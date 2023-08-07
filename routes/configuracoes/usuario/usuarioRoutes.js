const db = require('../../../config/db');
const multer = require('multer');
const path = require('path');
const { Router } = require('express');
const UsuarioController = require('../../../controllers/configuracoes/usuario/usuarioController');

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();
const route = '/usuario';

const getExtensions = async () => {
    const sql = `
    SELECT * 
    FROM unidade_extensao AS ue 
        JOIN extensao AS e ON (ue.extensaoID = e.extensaoID)
    WHERE ue.unidadeID = ?`
    const [result] = await db.promise().query(sql, [1])
    return result
}

const imageFilter = async (req, file, callback) => {
    const allowedUnityExtensions = await getExtensions();
    console.log("🚀 ~ allowedUnityExtensions:", allowedUnityExtensions)

    try {
        if (allowedUnityExtensions.length > 0) {
            let isValidExtension = false;

            for (const ext of allowedUnityExtensions) {
                if (file.mimetype.startsWith(ext.mimetype)) {
                    console.log("Encontrou a extensão permitida:", ext.nome, ext.mimetype);
                    isValidExtension = true;
                    break;
                }
            }

            if (isValidExtension) {
                console.log("É uma imagem válida.");
                callback(null, true);
            } else {
                console.log("Erro na imagem");
                throw new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'O arquivo enviado não é uma imagem válida.');
            }
        } else {
            console.log("Erro na imagem 2");
            throw new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Não há extensões permitidas para a unidade selecionada.');
        }
    } catch (err) {
        console.log("Erro na imagem 3");
        console.log("🚀 ~ err:", err)
        callback(err);
    }
};

const upload = ({ pathName, maxSize, usuarioID, unidadeID }) => multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, pathName)
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            console.log("🚀 ~ ext:", ext)
            cb(null, `${unidadeID}-${usuarioID}-${Date.now()}-${file.originalname}`);
        }
    }),
    limits: {
        fileSize: maxSize * 1024 * 1024 // 1MB (tamanho máximo permitido)
    },
    // fileFilter: (req, file, callback) => {
    //     imageFilter(req, file, (error, isValid) => {
    //         console.log('no filter......')
    //         if (error) {
    //             console.log('ERRO: no imageFilter 1')
    //             callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Não há extensões permitidas para a unidade selecionada.'));
    //             // callback(error); // Lidar com o erro aqui
    //         } else if (isValid) {
    //             console.log('VALIDO: no imageFilter 2')
    //             callback(null, true);
    //         } else {
    //             console.log('ERRO: no imageFilter 3')
    //             callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Não há extensões permitidas para a unidade selecionada.'));
    //             // callback(null, false);
    //         }
    //     });
    // }
    fileFilter: imageFilter
});

const profileImagesUpload = upload({
    pathName: path.resolve("uploads/profile"),
    maxSize: 1, // 8MB
    usuarioID: 1,
    unidadeID: 1
});

usuarioRoutes.get(`${route}`, usuarioController.getList);
usuarioRoutes.post(`${route}/getData/:id`, usuarioController.getData);
usuarioRoutes.post(`${route}/updateData/:id`, usuarioController.updateData);

usuarioRoutes.post(`${route}/photo-profile/:id`, profileImagesUpload.single('file'), usuarioController.updatePhotoProfile);

usuarioRoutes.delete(`${route}/photo-profile/:id`, usuarioController.handleDeleteImage);
usuarioRoutes.delete(`${route}/:id`, usuarioController.deleteData);
usuarioRoutes.post(`${route}/new/insertData`, usuarioController.insertData);

module.exports = usuarioRoutes;
