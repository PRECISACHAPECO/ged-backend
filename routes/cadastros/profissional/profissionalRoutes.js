const { Router } = require('express');

const ProfissionalController = require('../../../controllers/cadastros/profissional/profissionalController');
const profissionalController = new ProfissionalController();


const { configureMulterMiddleware } = require('../../../config/uploads');

const profissionalRoutes = Router();
const route = '/profissional';

profissionalRoutes.get(`${route}`, profissionalController.getList);
profissionalRoutes.post(`${route}/getData/:id`, profissionalController.getData);
profissionalRoutes.post(`${route}/new/getData`, profissionalController.getNewData);

profissionalRoutes.post(`${route}/updateData/:id`, profissionalController.updateData);

profissionalRoutes.delete(`${route}/photo-profile/:id`, profissionalController.handleDeleteImage);
profissionalRoutes.delete(`${route}/:id`, profissionalController.deleteData);
profissionalRoutes.post(`${route}/new/insertData`, profissionalController.insertData);

//? MULTER: Upload de arquivo
profissionalRoutes.post(`${route}/photo-profile/:id/:unidadeID`, (req, res, next) => {
    const isImage = 'true'
    configureMulterMiddleware(req, res, next, req.params.unidadeID, 'uploads/profile', isImage)
}, profissionalController.updatePhotoProfile);

module.exports = profissionalRoutes;
