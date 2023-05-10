const { Router } = require('express');
const authRoutes = Router();

const AuthController = require('../../controllers/auth/authController');
const authController = new AuthController();

//* Login da fábrica
const route = '/login';
authRoutes.post(`${route}`, authController.login);
authRoutes.get(`${route}`, authController.getAvailableRoutes);

module.exports = authRoutes;