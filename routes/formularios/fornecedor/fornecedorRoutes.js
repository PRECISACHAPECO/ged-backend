const { Router } = require('express');

const fornecedorRoutes = Router();
const { configureMulterMiddleware } = require('../../../config/uploads');

const FornecedorController = require('../../../controllers/formularios/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();
const route = '/formularios/fornecedor';

// Padrões
fornecedorRoutes.post(`${route}/getList`, fornecedorController.getList);
fornecedorRoutes.post(`${route}/getData/:id`, fornecedorController.getData);
fornecedorRoutes.post(`${route}/updateData/:id`, fornecedorController.updateData);
fornecedorRoutes.delete(`${route}/:id`, fornecedorController.deleteData);
fornecedorRoutes.delete(`${route}/deleteAnexo/:grupoanexoitemID/:id/:unidadeID/:usuarioID`, fornecedorController.deleteAnexo);
fornecedorRoutes.post(`${route}/novo`, fornecedorController.insertData);

// Específicos
fornecedorRoutes.post(`${route}/getFabricas`, fornecedorController.getFabricas);
fornecedorRoutes.post(`${route}/cnpj`, fornecedorController.getFornecedorByCnpj);
fornecedorRoutes.post(`${route}/makeFornecedor`, fornecedorController.makeFornecedor);
fornecedorRoutes.post(`${route}/fornecedorStatus`, fornecedorController.fornecedorStatus);
fornecedorRoutes.post(`${route}/sendMail`, fornecedorController.sendMail);
fornecedorRoutes.post(`${route}/getItemScore`, fornecedorController.getItemScore);
fornecedorRoutes.post(`${route}/saveItemScore`, fornecedorController.saveItemScore);
fornecedorRoutes.post(`${route}/getModels`, fornecedorController.getModels);
fornecedorRoutes.post(`${route}/getProducts`, fornecedorController.getProducts);
fornecedorRoutes.post(`${route}/getGruposAnexo`, fornecedorController.getGruposAnexo);

fornecedorRoutes.post(`${route}/conclusionAndSendForm/:id`, fornecedorController.conclusionAndSendForm);
fornecedorRoutes.post(`${route}/updateFormStatus/:id`, fornecedorController.updateFormStatus);
fornecedorRoutes.post(`${route}/getMovementHistory/:id`, fornecedorController.getMovementHistory);
fornecedorRoutes.post(`${route}/verifyFormPending/:id`, fornecedorController.verifyFormPending);
fornecedorRoutes.post(`${route}/changeFormStatus/:id`, fornecedorController.changeFormStatus);
fornecedorRoutes.post(`${route}/getGruposAnexo`, fornecedorController.getGruposAnexo);
fornecedorRoutes.post(`${route}/sendNotification`, fornecedorController.sendNotification);

//? MULTER: Upload de arquivo
fornecedorRoutes.post(`${route}/saveAnexo/:id/:unidadeID/:isImage`, (req, res, next) => {
    configureMulterMiddleware(req, res, next, req.params.unidadeID, 'uploads/anexos/', req.params.isImage)
}, fornecedorController.saveAnexo);

module.exports = fornecedorRoutes;