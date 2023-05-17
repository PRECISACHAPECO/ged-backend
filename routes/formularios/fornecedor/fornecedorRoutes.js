const { Router } = require('express');
const fornecedorRoutes = Router();

const FornecedorController = require('../../../controllers/formularios/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/formularios/fornecedor';

// Padrões
fornecedorRoutes.post(`${route}/getList`, fornecedorController.getList);
fornecedorRoutes.get(`${route}/:id`, fornecedorController.getData);
fornecedorRoutes.put(`${route}/:id`, fornecedorController.updateData);
fornecedorRoutes.delete(`${route}/:id`, fornecedorController.deleteData);
fornecedorRoutes.post(`${route}/novo`, fornecedorController.insertData);

// Específicos
fornecedorRoutes.post(`${route}/getFormStructure`, fornecedorController.getFormStructure);
fornecedorRoutes.post(`${route}/getFabricas`, fornecedorController.getFabricas);
fornecedorRoutes.post(`${route}/cnpj`, fornecedorController.getFornecedorByCnpj);
fornecedorRoutes.post(`${route}/makeFornecedor`, fornecedorController.makeFornecedor);
fornecedorRoutes.post(`${route}/fornecedorStatus`, fornecedorController.fornecedorStatus);
fornecedorRoutes.post(`${route}/sendMail`, fornecedorController.sendMail);

module.exports = fornecedorRoutes;