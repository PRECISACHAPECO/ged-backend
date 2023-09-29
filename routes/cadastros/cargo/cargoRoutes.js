const { Router } = require('express');
const cargoRoutes = Router();

const CargoController = require('../../../controllers/cadastros/cargo/cargoController');
const cargoController = new CargoController();

const route = '/cargo';

cargoRoutes.get(`${route}/:unidadeID`, cargoController.getList);
cargoRoutes.post(`${route}/getData/:id`, cargoController.getData);
cargoRoutes.post(`${route}/updateData/:id`, cargoController.updateData);
cargoRoutes.post(`${route}/new/insertData`, cargoController.insertData);
cargoRoutes.delete(`${route}/:id`, cargoController.deleteData);


module.exports = cargoRoutes;