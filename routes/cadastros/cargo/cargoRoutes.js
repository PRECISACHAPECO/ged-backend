const { Router } = require('express');
const cargoRoutes = Router();

const CargoController = require('../../../controllers/cadastros/cargo/cargoController');
const cargoController = new CargoController();

const route = '/cargo';

cargoRoutes.get(`${route}`, cargoController.getList);
cargoRoutes.get(`${route}/:id`, cargoController.getData);
cargoRoutes.put(`${route}/:id`, cargoController.updateData);
cargoRoutes.delete(`${route}/:id`, cargoController.deleteData);
cargoRoutes.post(`${route}/novo`, cargoController.insertData);

module.exports = cargoRoutes;