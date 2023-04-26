const { Router } = require('express');
const usuarioRoutes = Router();

const UsuarioController = require('../../../controllers/configuracoes/usuario/usuarioController');
const usuarioController = new UsuarioController();

const route = '/usuario';

usuarioRoutes.get(`${route}`, usuarioController.getList);
usuarioRoutes.get(`${route}/:id`, usuarioController.getData);
usuarioRoutes.put(`${route}/:id`, usuarioController.updateData);
usuarioRoutes.delete(`${route}/:id`, usuarioController.deleteData);
usuarioRoutes.post(`${route}/novo`, usuarioController.insertData);

module.exports = usuarioRoutes;