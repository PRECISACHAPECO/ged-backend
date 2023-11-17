const { Router } = require('express');
const LogController = require('../../../controllers/configuracoes/log/logController');


const logRoutes = Router();
const logController = new LogController();
const route = '/log';

logRoutes.get(`${route}/:id`, logController.getList);
logRoutes.get(`${route}/getData/:id`, logController.getData);

module.exports = logRoutes;
