const { Router } = require('express');
const routes = Router();

const urlBase = '/api'

const atividadeRouter = require("./atividadeRoutes");
const registerRouter = require("./registerRoutes");

routes.use(urlBase, atividadeRouter);
routes.use(urlBase, registerRouter);

module.exports = routes;

