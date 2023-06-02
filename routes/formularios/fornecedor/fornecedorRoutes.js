const { Router } = require('express');
const fornecedorRoutes = Router();

const FornecedorController = require('../../../controllers/formularios/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/formularios/fornecedor';

// Padrões
fornecedorRoutes.post(`${route}/getList/:unidadeID`, fornecedorController.getList);
fornecedorRoutes.get(`${route}/:id`, fornecedorController.getData);
fornecedorRoutes.put(`${route}/:id`, fornecedorController.updateData);
fornecedorRoutes.delete(`${route}/:id`, fornecedorController.deleteData);
fornecedorRoutes.post(`${route}/novo`, fornecedorController.insertData);

// Específicos
fornecedorRoutes.post(`${route}/getFabricas`, fornecedorController.getFabricas);
fornecedorRoutes.post(`${route}/cnpj`, fornecedorController.getFornecedorByCnpj);
fornecedorRoutes.post(`${route}/makeFornecedor`, fornecedorController.makeFornecedor);
fornecedorRoutes.post(`${route}/fornecedorStatus`, fornecedorController.fornecedorStatus);
fornecedorRoutes.post(`${route}/sendMail`, fornecedorController.sendMail);
fornecedorRoutes.post(`${route}/getItemScore`, fornecedorController.getItemScore);
fornecedorRoutes.post(`${route}/saveItemScore`, fornecedorController.saveItemScore);

fornecedorRoutes.post(`${route}/conclusionAndSendForm/:id`, fornecedorController.conclusionAndSendForm);
fornecedorRoutes.post(`${route}/updateFormStatus/:id`, fornecedorController.updateFormStatus);
fornecedorRoutes.post(`${route}/getMovementHistory/:id`, fornecedorController.getMovementHistory);
fornecedorRoutes.post(`${route}/verifyFormPending/:id`, fornecedorController.verifyFormPending);
fornecedorRoutes.post(`${route}/reOpenFormStatus/:id`, fornecedorController.reOpenFormStatus);

module.exports = fornecedorRoutes;