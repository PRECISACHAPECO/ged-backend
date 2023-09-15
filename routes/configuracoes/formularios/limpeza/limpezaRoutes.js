const { Router } = require('express');
const limpezaRoutes = Router();

const LimpezaController = require('../../../../controllers/formularios/limpeza/limpezaController');
const limpezaController = new LimpezaController();

const route = '/formularios/limpeza';

limpezaRoutes.get(`${route}/getList/:unidadeID`, limpezaController.getList);
limpezaRoutes.post(`${route}/getData`, limpezaController.getData);
// limpezaRoutes.put(`${route}/updateData`, limpezaController.updateData);
// limpezaRoutes.delete(`${route}/:id`, limpezaController.deleteData);

module.exports = limpezaRoutes;