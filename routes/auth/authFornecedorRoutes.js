const { Router } = require('express');
const authFornecedorRoutes = Router();

const AuthControllerFornecedor = require('../../controllers/auth/authControllerFornecedor');
const authControllerFornecedor = new AuthControllerFornecedor();


//* Login do fornecedor  
const routeFornecedor = '/login-fornecedor';
authFornecedorRoutes.post(`${routeFornecedor}`, authControllerFornecedor.loginFornecedor);
authFornecedorRoutes.get(`${routeFornecedor}`, authControllerFornecedor.getAvailableRoutes);
authFornecedorRoutes.post(`${routeFornecedor}/setAcessLink`, authControllerFornecedor.setAcessLink);
authFornecedorRoutes.post(`${routeFornecedor}/validationCNPJ`, authControllerFornecedor.ValidationCNPJ);

//* Cadastro do fornecedor
const routeRegister = '/registro-fornecedor';
authFornecedorRoutes.post(`${routeRegister}`, authControllerFornecedor.registroFornecedor);

module.exports = authFornecedorRoutes;
