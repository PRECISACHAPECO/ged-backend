const express = require('express');
const routerReports = express.Router();
const urlBase = '/api';

// Fornecedor
const { reportFornecedor } = require('../reports/fornecedor/generate');
routerReports.post(`${urlBase}/relatorio/fornecedor/`, reportFornecedor);

// Recebimento MP
const { reportRecebimentoMP } = require('../reports/recebimentoMP/generate');
routerReports.post(`${urlBase}/relatorio/recebimentoMP/`, reportRecebimentoMP);

module.exports = routerReports;