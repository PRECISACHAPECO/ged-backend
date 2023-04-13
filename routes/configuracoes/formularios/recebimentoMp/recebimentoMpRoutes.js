const { Router } = require('express');
const recebimentoMpRoutes = Router();

const RecebimentoMpController = require('../../../../controllers/configuracoes/formularios/recebimentoMp/recebimentoMpController');
const recebimentoMpController = new RecebimentoMpController();

const route = '/formularios/recebimentoMp';

recebimentoMpRoutes.get(`${route}/:id`, recebimentoMpController.getData);
recebimentoMpRoutes.put(`${route}/:id`, recebimentoMpController.updateData);
recebimentoMpRoutes.delete(`${route}/:id`, recebimentoMpController.deleteData);

module.exports = recebimentoMpRoutes;