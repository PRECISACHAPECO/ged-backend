const express = require('express');
const routerReports = express.Router();
const urlBase = '/api/relatorio';

const dadosForncedorGenerate = require('./formularios/fornecedor/dadosForncedorGenerate');
routerReports.post(`${urlBase}/fornecedor/dadosFornecedor`, dadosForncedorGenerate);




module.exports = routerReports;