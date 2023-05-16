const { Router } = require('express');
const authRoutes = Router();

const AuthController = require('../../controllers/auth/authController');
const authController = new AuthController();

//* Login da fábrica
const route = '/login';
const routeForgotEmailValidation = '/esqueceuSenha/validation'
const routeForgotPassword = '/esqueceuSenha';
authRoutes.post(`${route}`, authController.login);
authRoutes.get(`${route}`, authController.getAvailableRoutes);
authRoutes.post(`${routeForgotEmailValidation}`, authController.routeForgotEmailValidation);
authRoutes.post(`${routeForgotPassword}`, authController.forgotPassword);

module.exports = authRoutes;