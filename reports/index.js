const express = require('express');
const routerReports = express.Router();
const urlBase = '/api';

// Fornecedor
const { reportFornecedor } = require('../reports/fornecedor/generate');
routerReports.post(`${urlBase}/relatorio/fornecedor/`, reportFornecedor);

// Recepção
const { reportRecepcao } = require('../reports/recepcao/generate');
routerReports.post(`${urlBase}/relatorio/recepcao/`, reportRecepcao);

module.exports = routerReports;