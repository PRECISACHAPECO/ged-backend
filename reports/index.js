const express = require('express');
const routerReports = express.Router();
const urlBase = '/api/relatorio';

const dadosFornecedor = require('./formularios/fornecedor/dadosFornecedor');
routerReports.post(`${urlBase}/fornecedor/dadosFornecedor`, dadosFornecedor);


const dadosRecebimentoMp = require('./formularios/recebimentoMp/dadosRecebimentoMp');
routerReports.post(`${urlBase}/recebimentoMp/dadosRecebimentoMp`, dadosRecebimentoMp);





const headerReport = require('./layouts/headerReport');
routerReports.post(`${urlBase}/header`, headerReport);

module.exports = routerReports;
