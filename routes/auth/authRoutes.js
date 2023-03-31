const { Router } = require('express');
const authRoutes = Router();

const AuthController = require('../../controllers/auth/authController');
const authController = new AuthController();

const route = '/login';

authRoutes.post(`${route}`, authController.login);


module.exports = authRoutes;