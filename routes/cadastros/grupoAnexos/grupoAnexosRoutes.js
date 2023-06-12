const { Router } = require('express');
const grupoAnexosRoutes = Router();

const GrupoAnexosController = require('../../../controllers/cadastros/grupoAnexos/grupoAnexosController');
const grupoAnexosController = new GrupoAnexosController();

const route = '/grupo-anexos';

grupoAnexosRoutes.get(`${route}`, grupoAnexosController.getList);

grupoAnexosRoutes.get(`${route}/:id`, grupoAnexosController.getData);
grupoAnexosRoutes.get(`${route}/novo`, grupoAnexosController.getData);

grupoAnexosRoutes.post(`${route}/:id`, grupoAnexosController.updateData);
grupoAnexosRoutes.delete(`${route}/:id`, grupoAnexosController.deleteData);
grupoAnexosRoutes.post(`${route}/novo`, grupoAnexosController.insertData);

module.exports = grupoAnexosRoutes;
