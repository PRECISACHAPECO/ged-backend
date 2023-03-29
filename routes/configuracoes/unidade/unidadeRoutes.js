const { Router } = require('express');
const unidadeRoutes = Router();

const UnidadeController = require('../../../controllers/configuracoes/unidade/unidadeController');
const unidadeController = new UnidadeController();

const route = '/unidade';

unidadeRoutes.get(`${route}`, unidadeController.getList);
unidadeRoutes.get(`${route}/:id`, unidadeController.getData);
unidadeRoutes.put(`${route}/:id`, unidadeController.updateData);
unidadeRoutes.delete(`${route}/:id`, unidadeController.deleteData);
unidadeRoutes.post(`${route}/novo`, unidadeController.insertData);

module.exports = unidadeRoutes;