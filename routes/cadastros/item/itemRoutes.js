const { Router } = require('express');
const itemRoutes = Router();

const ItemController = require('../../../controllers/cadastros/item/itemController');
const itemController = new ItemController();

const route = '/item';

itemRoutes.get(`${route}`, itemController.getList);

itemRoutes.get(`${route}/:id`, itemController.getData);
itemRoutes.get(`${route}/novo`, itemController.getData);

itemRoutes.put(`${route}/:id`, itemController.updateData);
itemRoutes.delete(`${route}/:id`, itemController.deleteData);
itemRoutes.post(`${route}/novo`, itemController.insertData);

module.exports = itemRoutes;
