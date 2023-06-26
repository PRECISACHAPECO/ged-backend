const express = require('express');
const routerReports = express.Router();
const urlBase = '/api/relatorio';

const Fornecedor = require('./formularios/fornecedor/generate');
routerReports.post(`${urlBase}/fornecedor/dadosFornecedor`, Fornecedor);


module.exports = routerReports;