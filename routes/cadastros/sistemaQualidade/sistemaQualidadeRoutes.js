const { Router } = require('express');
const sistemaQualidadeRoutes = Router();

const SistemaQualidadeController = require('../../../controllers/cadastros/sistemaQualidadeController/sistemaQualidadeController');
const sistemaQualidadeController = new SistemaQualidadeController();

const route = '/sistema-qualidade';

sistemaQualidadeRoutes.get(`${route}`, sistemaQualidadeController.getList);
sistemaQualidadeRoutes.get(`${route}/:id`, sistemaQualidadeController.getData);
sistemaQualidadeRoutes.put(`${route}/:id`, sistemaQualidadeController.updateData);
sistemaQualidadeRoutes.delete(`${route}/:id`, sistemaQualidadeController.deleteData);
sistemaQualidadeRoutes.post(`${route}/novo`, sistemaQualidadeController.insertData);

module.exports = sistemaQualidadeRoutes;