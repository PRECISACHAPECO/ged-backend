const { Router } = require('express');
const produtosRoutes = Router();

const ProdutosController = require('../../../controllers/cadastros/produtos/produtosController');
const produtosController = new ProdutosController();

const route = '/produtos';

produtosRoutes.post(`${route}/`, produtosController.getList);
produtosRoutes.get(`${route}/:id`, produtosController.getData);

produtosRoutes.put(`${route}/:id`, produtosController.updateData);
produtosRoutes.delete(`${route}/:id`, produtosController.deleteData);
produtosRoutes.post(`${route}/novo`, produtosController.insertData);

module.exports = produtosRoutes;