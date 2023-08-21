const { Router } = require('express');

const fornecedorRoutes = Router();
const { configureMulterMiddleware } = require('../../../config/uploads/multerConfigFile');

const FornecedorController = require('../../../controllers/formularios/fornecedor/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/formularios/fornecedor';
// const { upload } = require('../../../config/uploads/multerConfigPDF');

// Padrões
fornecedorRoutes.post(`${route}/getList`, fornecedorController.getList);
// fornecedorRoutes.post(`${route}/saveAnexo/:id`, upload.array('pdfFiles'), fornecedorController.saveAnexo);

fornecedorRoutes.post(`${route}/getData/:id`, fornecedorController.getData);
fornecedorRoutes.put(`${route}/updateData/:id`, fornecedorController.updateData);
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
fornecedorRoutes.post(`${route}/changeFormStatus/:id`, fornecedorController.changeFormStatus);
fornecedorRoutes.post(`${route}/getGruposAnexo`, fornecedorController.getGruposAnexo);

//? MULTER: Upload de arquivo
fornecedorRoutes.post(`${route}/saveAnexo/:id/:unidadeID`, (req, res, next) => {
    const pathDestination = 'uploads/anexos/';
    console.log("🚀 ~ req.params.unidadeID:", req.params.unidadeID)
    configureMulterMiddleware(req, res, next, req.params.unidadeID, pathDestination);
}, fornecedorController.saveAnexo);

module.exports = fornecedorRoutes;