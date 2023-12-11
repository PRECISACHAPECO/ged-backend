const db = require('../../../../config/db')
const sendMailConfig = require('../../../../config/email');
const fornecedorPreenche = require('../../../../email/template/recebimentoMP/naoConformidade/fornecedorPreenche');


class NaoConformidade {
    async fornecedorPreenche(req, res) {

        let assunto = `GEDagro - Prencher não conformidade `
        let unidadeID = 1
        let usuarioID = 1
        let papelID = 1
        const logID = 88888
        const values = {
            // // fabrica
            // enderecoCompletoFabrica: enderecoCompleto,
            // nomeFantasiaFabrica: resultUnity[0].nomeFantasia,
            // cnpjFabrica: resultUnity[0].cnpj,
            unidadeID,
            usuarioID,
            papelID,


            // // new user 
            // nome: data.fields.nome,
            // cpf: data.fields.cpf,
            // senha: data.senha,

            // // professional
            // nomeProfissional: resultSqlProfessional[0]?.nome,
            // cargoProfissional: resultSqlProfessional[0]?.cargo,
            // papelID: data.papelID,

            // // outros
        }


        const destinatario = 'jonatankalmeidakk28@gmail.com'
        const html = await fornecedorPreenche(values);
        await sendMailConfig(destinatario, assunto, html, logID, values)
        res.status(200).json('ok')
    }
}

module.exports = NaoConformidade