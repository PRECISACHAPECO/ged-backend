const { Router } = require('express');
const naoConformidadeRoutes = Router();

const NaoConformidadeController = require('../../../../controllers/formularios/recebimentoMp/naoConformidade/naoConformidadeController');
const naoConformidadeController = new NaoConformidadeController();

const route = '/formularios/recebimento-mp/nao-conformidade';

naoConformidadeRoutes.get(`${route}/getList/:unidadeID`, naoConformidadeController.getList);
naoConformidadeRoutes.post(`${route}/getData/:id`, naoConformidadeController.getData);
naoConformidadeRoutes.post(`${route}/new/getData`, naoConformidadeController.getNewData);

naoConformidadeRoutes.post(`${route}/insertData`, naoConformidadeController.insertData);
naoConformidadeRoutes.post(`${route}/updateData/:id`, naoConformidadeController.updateData);

naoConformidadeRoutes.delete(`${route}/:id`, naoConformidadeController.deleteData);
naoConformidadeRoutes.post(`${route}/changeFormStatus/:id`, naoConformidadeController.changeFormStatus);
naoConformidadeRoutes.post(`${route}/verifyFormPending/:id`, naoConformidadeController.verifyFormPending);

module.exports = naoConformidadeRoutes;