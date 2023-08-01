const { Router } = require('express');
const unidadeRoutes = Router();

const UnidadeController = require('../../../controllers/configuracoes/unidade/unidadeController');
const unidadeController = new UnidadeController();

//! Upload de imagem
const { upload } = require('../../../config/uploads/multerConfigReport');

const route = '/unidade';

unidadeRoutes.get(`${route}`, unidadeController.getList);
unidadeRoutes.get(`${route}/:id`, unidadeController.getData);
unidadeRoutes.post(`${route}/updateData/:id`, unidadeController.updateData);
unidadeRoutes.post(`${route}/updateData/report/:id`, upload.single('fileReport'), unidadeController.updateDataReport);
unidadeRoutes.delete(`${route}/fileReport/:id`, unidadeController.handleDeleteImage);

unidadeRoutes.delete(`${route}/:id`, unidadeController.deleteData);
unidadeRoutes.post(`${route}/new/insertData`, unidadeController.insertData);

module.exports = unidadeRoutes;