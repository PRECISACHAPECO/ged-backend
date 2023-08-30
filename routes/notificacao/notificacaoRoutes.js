const { Router } = require('express');

const NotificacaoRoutes = Router();

const NotificacaoController = require('../../controllers/notificacao/notificacaoController');
const notificacaoController = new NotificacaoController();


NotificacaoRoutes.post(`/getData`, notificacaoController.getData);



module.exports = NotificacaoRoutes;