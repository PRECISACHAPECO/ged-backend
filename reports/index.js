const express = require('express');
const routerReports = express.Router();
const urlBase = '/api/relatorio';

const headerReport = require('./layouts/headerReport');
routerReports.post(`${urlBase}/header`, headerReport);

const dadosFornecedor = require('./formularios/fornecedor');
routerReports.post(`${urlBase}/fornecedor/dadosFornecedor`, dadosFornecedor);


const dadosRecebimentoMp = require('./formularios/recebimentoMp/dadosRecebimentoMp');
routerReports.post(`${urlBase}/recebimentoMp/dadosRecebimentoMp`, dadosRecebimentoMp);

module.exports = routerReports;