const { Router } = require('express');
const transportadorRoutes = Router();

const TransportadorController = require('../../../controllers/cadastros/transportador/transportadorController');
const transportadorController = new TransportadorController();

const route = '/transportador';

transportadorRoutes.post(`${route}/`, transportadorController.getList);
transportadorRoutes.get(`${route}/:id`, transportadorController.getData);

transportadorRoutes.put(`${route}/:id`, transportadorController.updateData);
transportadorRoutes.delete(`${route}/:id`, transportadorController.deleteData);
transportadorRoutes.post(`${route}/novo`, transportadorController.insertData);

module.exports = transportadorRoutes;