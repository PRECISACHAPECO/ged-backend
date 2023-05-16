const { Router } = require('express');
const authRoutes = Router();

const AuthController = require('../../controllers/auth/authController');
const authController = new AuthController();

//* Login da fábrica
const route = '/login';
const routeForgotPassword = '/esqueceuSenha';
authRoutes.post(`${route}`, authController.login);
authRoutes.get(`${route}`, authController.getAvailableRoutes);
authRoutes.post(`${routeForgotPassword}`, authController.forgotPassword);
authRoutes.post(`${routeForgotPassword}/validation`, authController.routeForgotEmailValidation);
authRoutes.post(`${routeForgotPassword}/newPassword`, authController.routeForgotNewPassword);

module.exports = authRoutes;