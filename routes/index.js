const { Router } = require('express');
const routes = Router();

const atividadeRouter = require("./atividadeRoutes");
const registerRouter = require("./registerRoutes");

routes.use("/", atividadeRouter);
routes.use("/", registerRouter);

module.exports = routes;

