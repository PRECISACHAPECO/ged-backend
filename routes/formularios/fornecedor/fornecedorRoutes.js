const { Router } = require('express');
const fornecedorRoutes = Router();

const FornecedorController = require('../../../controllers/formularios/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/formularios/fornecedor';

fornecedorRoutes.get(`${route}/:id`, fornecedorController.getData);
fornecedorRoutes.put(`${route}/:id`, fornecedorController.updateData);
fornecedorRoutes.delete(`${route}/:id`, fornecedorController.deleteData);
fornecedorRoutes.post(`${route}/novo`, fornecedorController.insertData);

fornecedorRoutes.post(`${route}/cnpj`, fornecedorController.getFornecedorByCnpj);
fornecedorRoutes.post(`${route}/makeFornecedor`, fornecedorController.makeFornecedor);

module.exports = fornecedorRoutes;