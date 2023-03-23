const { Router } = require('express');
const routes = Router();

const urlBase = '/api'

const atividadeRouter = require("./atividadeRoutes");

routes.use(urlBase+'/cadastros', atividadeRouter);

module.exports = routes;

