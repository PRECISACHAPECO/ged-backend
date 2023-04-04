const { Router } = require('express');
const fornecedorRoutes = Router();

const FornecedorController = require('../../../controllers/pop01/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/fornecedor';

fornecedorRoutes.get(`${route}/:id`, fornecedorController.getData);
fornecedorRoutes.put(`${route}/:id`, fornecedorController.updateData);
fornecedorRoutes.delete(`${route}/:id`, fornecedorController.deleteData);
fornecedorRoutes.post(`${route}/novo`, fornecedorController.insertData);

module.exports = fornecedorRoutes;