const { Router } = require('express');
const usuarioRoutes = Router();

const UsuarioController = require('../../../controllers/configuracoes/usuario/usuarioController');
const usuarioController = new UsuarioController();

//! Upload de imagem
const { upload } = require('../../../config/uploads/multerConfigPhoto');

const route = '/usuario';

usuarioRoutes.get(`${route}`, usuarioController.getList);
usuarioRoutes.get(`${route}/:id`, usuarioController.getData);
usuarioRoutes.put(`${route}/:id`, usuarioController.updateData);
usuarioRoutes.post(`${route}/photo-profile/:id`, upload.single('photoProfile'), usuarioController.updatePhotoProfile);
usuarioRoutes.delete(`${route}/photo-profile/:id`, usuarioController.handleDeleteImage);

usuarioRoutes.delete(`${route}/:id`, usuarioController.deleteData);
usuarioRoutes.post(`${route}/novo`, usuarioController.insertData);

module.exports = usuarioRoutes;