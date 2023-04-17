const { Router } = require('express');
const recebimentoMpRoutes = Router();

const RecebimentoMpController = require('../../controllers/recebimentoMp/recebimentoMpController');
const recebimentoMpController = new RecebimentoMpController();

const route = '/recebimento-mp';

recebimentoMpRoutes.get(`${route}/:id`, recebimentoMpController.getData);
recebimentoMpRoutes.put(`${route}/:id`, recebimentoMpController.updateData);
recebimentoMpRoutes.delete(`${route}/:id`, recebimentoMpController.deleteData);
recebimentoMpRoutes.post(`${route}/novo`, recebimentoMpController.insertData);

module.exports = recebimentoMpRoutes;