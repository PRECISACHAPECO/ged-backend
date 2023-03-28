const { Router } = require('express');
const fornecedorRoutes = Router();

const FornecedorController = require('../../../../controllers/configuracoes/formularios/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/formularios/fornecedor';

// fornecedorRoutes.get(`${route}`, fornecedorController.getList);
fornecedorRoutes.get(`${route}/`, fornecedorController.getData);
fornecedorRoutes.put(`${route}/`, fornecedorController.updateData);
fornecedorRoutes.delete(`${route}/:id`, fornecedorController.deleteData);

module.exports = fornecedorRoutes;