const express = require('express');
const routerReports = express.Router();
const urlBase = '/api';

const { fornecedor } = require('./formularios/fornecedor/fornecedor');
routerReports.post(`${urlBase}/relatorio/fornecedor/`, fornecedor);


module.exports = routerReports;