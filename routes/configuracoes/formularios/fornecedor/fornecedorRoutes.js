const { Router } = require('express');
const fornecedorRoutes = Router();

const FornecedorController = require('../../../../controllers/configuracoes/formularios/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/formularios/fornecedor';

fornecedorRoutes.post(`${route}/getData`, fornecedorController.getData);
fornecedorRoutes.put(`${route}/updateData`, fornecedorController.updateData);
fornecedorRoutes.delete(`${route}/:id`, fornecedorController.deleteData);

module.exports = fornecedorRoutes;