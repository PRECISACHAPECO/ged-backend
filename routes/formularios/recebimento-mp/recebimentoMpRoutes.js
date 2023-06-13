const { Router } = require('express');
const recebimentoMpRoutes = Router();

const RecebimentoMpController = require('../../../controllers/formularios/recebimentoMp/recebimentoMpController');
const recebimentoMpController = new RecebimentoMpController();

const route = '/formularios/recebimento-mp';

recebimentoMpRoutes.get(`${route}/getList/:unidadeID`, recebimentoMpController.getList);
recebimentoMpRoutes.post(`${route}/getData/:id`, recebimentoMpController.getData);

recebimentoMpRoutes.post(`${route}/insertData`, recebimentoMpController.insertData);
recebimentoMpRoutes.put(`${route}/:id`, recebimentoMpController.updateData);

recebimentoMpRoutes.delete(`${route}/:id`, recebimentoMpController.deleteData);
recebimentoMpRoutes.post(`${route}/changeFormStatus/:id`, recebimentoMpController.changeFormStatus);
recebimentoMpRoutes.post(`${route}/verifyFormPending/:id`, recebimentoMpController.verifyFormPending);

module.exports = recebimentoMpRoutes;