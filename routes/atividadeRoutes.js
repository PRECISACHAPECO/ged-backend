const { Router }  = require('express');
const atividadeRoutes = Router(); 

const AtividadeController = require('../controllers/atividadeController');
const atividadeController = new AtividadeController();

atividadeRoutes.get("/atividade", atividadeController.getList);
atividadeRoutes.post("/atividade", atividadeController.insertData);
atividadeRoutes.delete("/atividade/:id", atividadeController.deleteData);
// registerRoutes.post("/register/:userID", registerController.create);
// registerRoutes.get("/register/:registerID", registerController.listiD);

module.exports = atividadeRoutes;