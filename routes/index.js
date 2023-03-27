const { Router } = require('express');
const routes = Router();
const urlBase = '/api'

// Cadastros 
const atividadeRouter = require("./cadastros/atividade/atividadeRoutes");
const itemRouter = require("./cadastros/item/itemRoutes");
routes.use(urlBase + '/cadastros', atividadeRouter);
routes.use(urlBase + '/cadastros', itemRouter);

// Confifuracoes
const formularios = require("./configuracoes/formularios/formulariosRoutes");
const formularioFornecedor = require("./configuracoes/formularios/fornecedor/fornecedorRoutes");

routes.use(urlBase + '/configuracoes', formularios);
routes.use(urlBase + '/configuracoes', formularioFornecedor);

module.exports = routes;