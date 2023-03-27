const { Router } = require('express');
const atividadeRoutes = Router();

const AtividadeController = require('../../../controllers/cadastros/atividade/atividadeController');
const atividadeController = new AtividadeController();

const route = '/atividade';

atividadeRoutes.get(`${route}`, atividadeController.getList);
atividadeRoutes.get(`${route}/:id`, atividadeController.getData);
atividadeRoutes.put(`${route}/:id`, atividadeController.updateData);
atividadeRoutes.delete(`${route}/:id`, atividadeController.deleteData);
atividadeRoutes.post(`${route}/novo`, atividadeController.insertData);

module.exports = atividadeRoutes;