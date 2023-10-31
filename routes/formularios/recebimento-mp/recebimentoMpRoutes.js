const { Router } = require('express');
const recebimentoMpRoutes = Router();
const { configureMulterMiddleware } = require('../../../config/uploads');

const RecebimentoMpController = require('../../../controllers/formularios/recebimentoMp/recebimentoMpController');
const recebimentoMpController = new RecebimentoMpController();

const route = '/formularios/recebimento-mp';

// NEW
recebimentoMpRoutes.get(`${route}/getList/:unidadeID`, recebimentoMpController.getList);
recebimentoMpRoutes.post(`${route}/getData/:id`, recebimentoMpController.getData);
recebimentoMpRoutes.post(`${route}/insertData`, recebimentoMpController.insertData);

recebimentoMpRoutes.get(`${route}/getModels/:unidadeID`, recebimentoMpController.getModels);
recebimentoMpRoutes.post(`${route}/updateData/:id`, recebimentoMpController.updateData);

//? MULTER: Upload de arquivo
recebimentoMpRoutes.delete(`${route}/deleteAnexo/:id/:anexoID/:unidadeID/:usuarioID/:folder`, recebimentoMpController.deleteAnexo);
recebimentoMpRoutes.post(`${route}/saveAnexo/:id/:folder/:usuarioID/:unidadeID`, (req, res, next) => {
    const folder = req.params.folder ?? '/' //? Pasta destino do arquivo (grupo-anexo/produto/item/...)
    const pathDestination = `uploads/${req.params.unidadeID}/recebimento-mp/${folder}/`
    req.pathDestination = pathDestination
    configureMulterMiddleware(req, res, next, req.params.usuarioID, req.params.unidadeID, pathDestination)
}, recebimentoMpController.saveAnexo);

// recebimentoMpRoutes.delete(`${route}/:id`, recebimentoMpController.deleteData);
// recebimentoMpRoutes.delete(`${route}/deleteAnexo/:grupoAnexoItemID/:id/:unidadeID/:usuarioID`, recebimentoMpController.deleteAnexo);
// recebimentoMpRoutes.post(`${route}/novo`, recebimentoMpController.insertData);

// OLD
// recebimentoMpRoutes.get(`${route}/getList/:unidadeID`, recebimentoMpController.getList);
// recebimentoMpRoutes.post(`${route}/getData/:id`, recebimentoMpController.getData);
// recebimentoMpRoutes.post(`${route}/new/getData`, recebimentoMpController.getNewData);
// recebimentoMpRoutes.post(`${route}/insertData`, recebimentoMpController.insertData);
// recebimentoMpRoutes.post(`${route}/updateData/:id`, recebimentoMpController.updateData);
// recebimentoMpRoutes.delete(`${route}/:id`, recebimentoMpController.deleteData);
// recebimentoMpRoutes.post(`${route}/changeFormStatus/:id`, recebimentoMpController.changeFormStatus);
// recebimentoMpRoutes.post(`${route}/verifyFormPending/:id`, recebimentoMpController.verifyFormPending);

module.exports = recebimentoMpRoutes;