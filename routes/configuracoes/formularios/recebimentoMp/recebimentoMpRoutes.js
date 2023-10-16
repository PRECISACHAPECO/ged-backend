const { Router } = require('express');
const recebimentoMpRoutes = Router();

const RecebimentoMpController = require('../../../../controllers/configuracoes/formularios/recebimentoMp/recebimentoMpController');
const recebimentoMpController = new RecebimentoMpController();

const route = '/formularios/recebimento-mp';

recebimentoMpRoutes.get(`${route}/getList/:unidadeID`, recebimentoMpController.getList);
recebimentoMpRoutes.post(`${route}/getData`, recebimentoMpController.getData);
recebimentoMpRoutes.put(`${route}/updateData`, recebimentoMpController.updateData);

module.exports = recebimentoMpRoutes;