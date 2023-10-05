const { Router } = require('express');

const FornecedorRoutes = Router();

const FornecedorController = require('../../controllers/dashboard/fornecedorController');
const fornecedorController = new FornecedorController();

const route = '/fornecedor';


FornecedorRoutes.get(`${route}/getData/:unidadeID`, fornecedorController.getData);



module.exports = FornecedorRoutes;