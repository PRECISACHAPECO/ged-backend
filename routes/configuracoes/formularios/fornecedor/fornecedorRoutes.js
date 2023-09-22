const { Router } = require('express');
const fornecedorRoutes = Router();

const FornecedorController = require('../../../../controllers/configuracoes/formularios/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/formularios/fornecedor';

fornecedorRoutes.get(`${route}/getList/:unidadeID`, fornecedorController.getList);
fornecedorRoutes.post(`${route}/getData`, fornecedorController.getData);
fornecedorRoutes.put(`${route}/updateData`, fornecedorController.updateData);

module.exports = fornecedorRoutes;