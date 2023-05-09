const { Router } = require('express');
const authRoutes = Router();

const AuthController = require('../../controllers/auth/authController');
const authController = new AuthController();

//* Cadastro do fornecedor
const routeRegister = '/registro';
authRoutes.post(`${routeRegister}`, authController.register);

//* Login da fábrica
const route = '/login';
authRoutes.post(`${route}`, authController.login);
authRoutes.get(`${route}`, authController.getAvailableRoutes);

//* Login dor fornecedor 
const routeFornecedor = '/login-fornecedor';
authRoutes.post(`${routeFornecedor}`, authController.loginFornecedor);

module.exports = authRoutes;