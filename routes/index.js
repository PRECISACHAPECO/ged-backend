const { Router } = require('express');
const routes = Router();
const urlBase = '/api'

// Autenticação
const auth = require("./auth/authRoutes");
routes.use(urlBase + '/', auth);

// Fornecedor
const fornecedorRouter = require("./fornecedor/fornecedorRoutes");
routes.use(urlBase, fornecedorRouter);

// Cadastros 
const atividadeRouter = require("./cadastros/atividade/atividadeRoutes");
const itemRouter = require("./cadastros/item/itemRoutes");
const sistemaQualidadeRouter = require("./cadastros/sistemaQualidade/sistemaQualidadeRoutes");
const tipoVeiculoRouter = require("./cadastros/tipoVeiculo/tipoVeiculoRoutes");
const transportadorRouter = require("./cadastros/transportador/transportadorRoutes");
routes.use(urlBase + '/cadastros', atividadeRouter);
routes.use(urlBase + '/cadastros', itemRouter);
routes.use(urlBase + '/cadastros', sistemaQualidadeRouter);
routes.use(urlBase + '/cadastros', tipoVeiculoRouter);
routes.use(urlBase + '/cadastros', transportadorRouter);

// Confifuracoes
const formularios = require("./configuracoes/formularios/formulariosRoutes");
const formularioFornecedor = require("./configuracoes/formularios/fornecedor/fornecedorRoutes");
const formularioRecebimentoMp = require("./configuracoes/formularios/recebimentoMp/recebimentoMpRoutes");
const unidade = require("./configuracoes/unidade/unidadeRoutes");
routes.use(urlBase + '/configuracoes', formularios);
routes.use(urlBase + '/configuracoes', formularioFornecedor);
routes.use(urlBase + '/configuracoes', formularioRecebimentoMp);
routes.use(urlBase + '/configuracoes', unidade);

module.exports = routes;