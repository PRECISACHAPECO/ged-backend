const { Router } = require('express');
const tipoVeiculoRoutes = Router();

const TipoVeiculoController = require('../../../controllers/cadastros/tipoVeiculoController/tipoVeiculoController');
const tipoVeiculoController = new TipoVeiculoController();

const route = '/tipo-veiculo';

tipoVeiculoRoutes.get(`${route}`, tipoVeiculoController.getList);
tipoVeiculoRoutes.get(`${route}/:id`, tipoVeiculoController.getData);
tipoVeiculoRoutes.put(`${route}/:id`, tipoVeiculoController.updateData);
tipoVeiculoRoutes.delete(`${route}/:id`, tipoVeiculoController.deleteData);
tipoVeiculoRoutes.post(`${route}/novo`, tipoVeiculoController.insertData);

module.exports = tipoVeiculoRoutes;