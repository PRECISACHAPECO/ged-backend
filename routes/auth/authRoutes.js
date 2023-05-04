const { Router } = require('express');
const authRoutes = Router();

const AuthController = require('../../controllers/auth/authController');
const authController = new AuthController();

const route = '/login';
const routeRegister = '/registro';

authRoutes.post(`${route}`, authController.login);
authRoutes.get(`${route}`, authController.getAvailableRoutes);
authRoutes.post(`${routeRegister}`, authController.register);

module.exports = authRoutes;