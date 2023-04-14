const { Router } = require('express');
const apresentacaoRoutes = Router();

const ApresentacaoController = require('../../../controllers/cadastros/apresentacao/apresentacaoController');
const apresentacaoController = new ApresentacaoController();

const route = '/apresentacao';

apresentacaoRoutes.get(`${route}`, apresentacaoController.getList);
apresentacaoRoutes.get(`${route}/:id`, apresentacaoController.getData);
apresentacaoRoutes.put(`${route}/:id`, apresentacaoController.updateData);
apresentacaoRoutes.delete(`${route}/:id`, apresentacaoController.deleteData);
apresentacaoRoutes.post(`${route}/novo`, apresentacaoController.insertData);

module.exports = apresentacaoRoutes;