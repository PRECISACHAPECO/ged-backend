const { Router } = require('express');

const fornecedorRoutes = Router();
const { configureMulterMiddleware } = require('../../../config/uploads');

const FornecedorController = require('../../../controllers/formularios/fornecedor/fornecedorController');
const { getDocumentSignature, signedReport } = require('../../../defaults/functions');
const fornecedorController = new FornecedorController();
const route = '/formularios/fornecedor';
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Padrões
fornecedorRoutes.post(`${route}/getList`, fornecedorController.getList);
fornecedorRoutes.post(`${route}/getData/:id`, fornecedorController.getData);
fornecedorRoutes.post(`${route}/updateData/:id`, fornecedorController.updateData);
fornecedorRoutes.delete(`${route}/delete/:id/:usuarioID/:unidadeID`, fornecedorController.deleteData);

// Específicos
fornecedorRoutes.post(`${route}/getFabricas`, fornecedorController.getFabricas);
fornecedorRoutes.post(`${route}/cnpj`, fornecedorController.getFornecedorByCnpj);

// Verifica quem preenche o formulario do fornecedor
fornecedorRoutes.post(`${route}/paramsNewFornecedor`, fornecedorController.paramsNewFornecedor);

fornecedorRoutes.post(`${route}/makeFornecedor`, fornecedorController.makeFornecedor);
fornecedorRoutes.post(`${route}/fornecedorStatus`, fornecedorController.fornecedorStatus);
// fornecedorRoutes.post(`${route}/sendMail`, fornecedorController.sendMail);
fornecedorRoutes.post(`${route}/getItemScore`, fornecedorController.getItemScore);
fornecedorRoutes.post(`${route}/saveItemScore`, fornecedorController.saveItemScore);
fornecedorRoutes.post(`${route}/getModels`, fornecedorController.getModels);
fornecedorRoutes.post(`${route}/getProducts`, fornecedorController.getProducts);
fornecedorRoutes.post(`${route}/getGruposAnexo`, fornecedorController.getGruposAnexo);

fornecedorRoutes.post(`${route}/conclusionAndSendForm/:id`, fornecedorController.conclusionAndSendForm);
fornecedorRoutes.post(`${route}/updateFormStatus/:id`, fornecedorController.updateFormStatus);
fornecedorRoutes.post(`${route}/getMovementHistory/:id`, fornecedorController.getMovementHistory);
fornecedorRoutes.post(`${route}/verifyFormPending/:id`, fornecedorController.verifyFormPending);
fornecedorRoutes.post(`${route}/changeFormStatus/:id`, fornecedorController.changeFormStatus);
fornecedorRoutes.post(`${route}/getGruposAnexo`, fornecedorController.getGruposAnexo);
fornecedorRoutes.post(`${route}/sendNotification`, fornecedorController.sendNotification);
fornecedorRoutes.post(`${route}/getFornecedoresAprovados`, fornecedorController.getFornecedoresAprovados);


//Envia email baseado no status do fornecedor
fornecedorRoutes.post(`${route}/sendEmailBasedStatus`, fornecedorController.sendEmailBasedStatus);

// Anexos
fornecedorRoutes.delete(`${route}/deleteAnexo/:id/:anexoID/:unidadeID/:usuarioID/:folder`, fornecedorController.deleteAnexo);
//? MULTER: Upload de arquivo
fornecedorRoutes.post(`${route}/saveAnexo/:id/:folder/:usuarioID/:unidadeID`, (req, res, next) => {
    const folder = req.params.folder ?? '/' //? Pasta destino do arquivo (grupo-anexo/produto/item/...)
    const pathDestination = `uploads/${req.params.unidadeID}/fornecedor/${folder}/`
    req.pathDestination = pathDestination
    configureMulterMiddleware(req, res, next, req.params.usuarioID, req.params.unidadeID, pathDestination)
}, fornecedorController.saveAnexo);

//? MULTER: Salva relatório
fornecedorRoutes.post(`${route}/saveRelatorio/:id/:usuarioID/:unidadeID`, (req, res, next) => {
    const pathDestination = `uploads/${req.params.unidadeID}/fornecedor/relatorio/original`
    req.pathDestination = pathDestination
    configureMulterMiddleware(req, res, next, req.params.usuarioID, req.params.unidadeID, pathDestination, false)
}, fornecedorController.saveRelatorio);


// Assinatura relatório
fornecedorRoutes.post(`${route}/assinaturaRelatorio/:id/:usuarioID/:unidadeID`, fornecedorController.assinaturaRelatorio);
// Baixa relatório assinado
// fornecedorRoutes.post(`${route}/saveSignatureReport/:id/:usuarioID/:unidadeID`, fornecedorController.saveSignatureReport);
//? MULTER: Salva relatório assinado vindo do autentique
fornecedorRoutes.post(`${route}/saveSignatureReport/:id/:usuarioID/:unidadeID/:reportSignature`, async (req, res, next) => {
    const { id, usuarioID, unidadeID, reportSignature } = req.params
    const pathReport = await getDocumentSignature(reportSignature)
    const signed = await signedReport(pathReport) // verifica se o arquivo foi assinado






    if (signed) {
        // Cria arquivo pdf
        const formData = new FormData();
        formData.append('files[]', fs.createReadStream(pathReport));
        console.log("🚀 ~ formData:", formData)

        const pathDestination = `uploads/${unidadeID}/fornecedor/relatorio/assinado`
        // gravar arquivo no pathDestination 
        const options = {
            method: 'POST',
            url: 'https://api.cloudmersive.com_parse/v1/parse/convert',
            headers: {


                'Content-Type': 'multipart/form-data'

            },
            formData: formData
        };


        const response = await axios.request(options).catch(function (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log(error.config);
        });
        console.log("🚀 ~ response:", response)









        req.pathDestination = pathDestination
        configureMulterMiddleware(req, res, next, usuarioID, unidadeID, pathDestination, false)
    } else {
        res.status(400).json({ message: 'Relatório não assinado' })
    }
}, fornecedorController.saveSignatureReport);






module.exports = fornecedorRoutes;