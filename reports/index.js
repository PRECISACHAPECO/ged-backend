const express = require('express');
const routerReports = express.Router();
const urlBase = '/api/relatorio';

const dadosFornecedor = require('./formularios/fornecedor/dadosFornecedor');
routerReports.post(`${urlBase}/fornecedor/dadosFornecedor`, dadosFornecedor);


module.exports = routerReports;
