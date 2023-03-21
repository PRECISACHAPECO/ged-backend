const { Router } = require('express');
const atividadeRoutes = Router();

const AtividadeController = require('../controllers/atividadeController');
const atividadeController = new AtividadeController();

atividadeRoutes.get("/atividade", atividadeController.getList);
atividadeRoutes.get("/atividade/:id", atividadeController.getData);
atividadeRoutes.put("/atividade/:id", atividadeController.updateData);
atividadeRoutes.delete("/atividade/:id", atividadeController.deleteData);






atividadeRoutes.post("/atividade", atividadeController.insertData);
// registerRoutes.post("/register/:userID", registerController.create);
// registerRoutes.get("/register/:registerID", registerController.listiD);

module.exports = atividadeRoutes;