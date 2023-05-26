const express = require('express');
const routerReports = express.Router();
const urlBase = '/api';

// // Fornecedor
const { reportFornecedor } = require('../reports/fornecedor/generate');
routerReports.get(`${urlBase}/relatorio/fornecedor/`, reportFornecedor);

// // Recebimento MP
// const { reportRecebimentoMP } = require('../reports/recebimentoMP/generate');
// routerReports.post(`${urlBase}/relatorio/recebimentoMP/`, reportRecebimentoMP);

// //teste
// const { teste } = require('../reports/teste/generate');
// routerReports.post(`${urlBase}/teste`, teste);

// //Fornecedor
// const { reportFornecedor } = require('./fornecedorAA/generate');
// routerReports.get(`${urlBase}/relatorio/fornecedor/`, reportFornecedor);

module.exports = routerReports;