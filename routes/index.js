const { Router } = require('express');
const routes = Router();
const urlBase = '/api'

// Autenticação
const auth = require("./auth/authRoutes");
const authFornecedor = require("./auth/authFornecedorRoutes");
routes.use(urlBase + '/', authFornecedor);
routes.use(urlBase + '/', auth);


// Dashborards
const fabricaRouter = require("./dashboard/fabricaRoutes")
routes.use(urlBase + '/dashboard', fabricaRouter);

// Fornecedor
const fornecedorRouter = require("./formularios/fornecedor/fornecedorRoutes");
routes.use(urlBase, fornecedorRouter);

// Recebimento de MP
const recebimentoMpRouter = require("./formularios/recebimento-mp/recebimentoMpRoutes");
routes.use(urlBase, recebimentoMpRouter);

// Recebimento de MP / Não Conformidade
const naoConformidadeRouter = require("./formularios/recebimento-mp/nao-conformidade/naoConformidadeRoutes");
routes.use(urlBase, naoConformidadeRouter);

// Limpeza
const limpezaRouter = require("./formularios/limpeza/limpezaRoutes");
routes.use(urlBase, limpezaRouter);

// Cadastros 
const atividadeRouter = require("./cadastros/atividade/atividadeRoutes");
const itemRouter = require("./cadastros/item/itemRoutes");
const sistemaQualidadeRouter = require("./cadastros/sistemaQualidade/sistemaQualidadeRoutes");
const tipoVeiculoRouter = require("./cadastros/tipoVeiculo/tipoVeiculoRoutes");
const transportadorRouter = require("./cadastros/transportador/transportadorRoutes");
const ApresentacaoRouter = require("./cadastros/apresentacao/apresentacaoRoutes");
const ProfissaoRouter = require("./cadastros/profissao/profissaoRoutes");
const CargoRouter = require("./cadastros/cargo/cargoRoutes");
const GrupoAnexosRouter = require("./cadastros/grupoAnexos/grupoAnexosRoutes");
const ProdutoRoutes = require("./cadastros/produto/produtoRoutes");

routes.use(urlBase + '/cadastros', atividadeRouter);
routes.use(urlBase + '/cadastros', itemRouter);
routes.use(urlBase + '/cadastros', sistemaQualidadeRouter);
routes.use(urlBase + '/cadastros', tipoVeiculoRouter);
routes.use(urlBase + '/cadastros', transportadorRouter);
routes.use(urlBase + '/cadastros', ApresentacaoRouter);
routes.use(urlBase + '/cadastros', ProfissaoRouter);
routes.use(urlBase + '/cadastros', CargoRouter);
routes.use(urlBase + '/cadastros', GrupoAnexosRouter);
routes.use(urlBase + '/cadastros', ProdutoRoutes);

//? Configuracoes
const formularios = require("./configuracoes/formularios/formulariosRoutes");
const formularioFornecedor = require("./configuracoes/formularios/fornecedor/fornecedorRoutes");
const formularioRecebimentoMp = require("./configuracoes/formularios/recebimentoMp/recebimentoMpRoutes");
const formularioLimpeza = require("./configuracoes/formularios/limpeza/limpezaRoutes");
const unidade = require("./configuracoes/unidade/unidadeRoutes");
const UsuarioRouter = require("./configuracoes/usuario/usuarioRoutes");
const NotificacaoRouter = require("./configuracoes/notificacao/notificacaoRoutes");
const ProdutosRouter = require("./configuracoes/produtos/produtosRoutes");

routes.use(urlBase + '/configuracoes', formularios);
routes.use(urlBase + '/configuracoes', formularioFornecedor);
routes.use(urlBase + '/configuracoes', formularioRecebimentoMp);
routes.use(urlBase + '/configuracoes', formularioLimpeza);
routes.use(urlBase + '/configuracoes', unidade);
routes.use(urlBase + '/configuracoes', UsuarioRouter);
routes.use(urlBase + '/configuracoes', NotificacaoRouter);
routes.use(urlBase + '/configuracoes', ProdutosRouter);

// Notificação
const notificacao = require('./notificacao/notificacaoRoutes');
routes.use(urlBase + '/notificacao', notificacao);

module.exports = routes;