const { Router } = require('express');
const routes = Router();
const urlBase = '/api'

// Autenticação
const auth = require("./auth/authRoutes");
routes.use(urlBase + '/', auth);

// Pop-01
const fornecedorRouter = require("./pop01/fornecedor/fornecedorRoutes");
routes.use(urlBase + '/pop01', fornecedorRouter);

// Cadastros 
const atividadeRouter = require("./cadastros/atividade/atividadeRoutes");
const itemRouter = require("./cadastros/item/itemRoutes");
const sistemaQualidadeRouter = require("./cadastros/sistemaQualidade/sistemaQualidadeRoutes");
routes.use(urlBase + '/cadastros', atividadeRouter);
routes.use(urlBase + '/cadastros', itemRouter);
routes.use(urlBase + '/cadastros', sistemaQualidadeRouter);

// Confifuracoes
const formularios = require("./configuracoes/formularios/formulariosRoutes");
const formularioFornecedor = require("./configuracoes/formularios/fornecedor/fornecedorRoutes");
const unidade = require("./configuracoes/unidade/unidadeRoutes");
routes.use(urlBase + '/configuracoes', formularios);
routes.use(urlBase + '/configuracoes', formularioFornecedor);
routes.use(urlBase + '/configuracoes', unidade);



module.exports = routes;