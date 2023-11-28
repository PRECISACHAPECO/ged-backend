const db = require('../../../../config/db');

const dynamic = async (data) => {

    sqlRecebimentoMp = `
    SELECT 
    a.*,
    b.nome AS quemAbriu,
    c.nome AS aprovaProfissional,
    d.nome AS finalizaProfissional,
    e.nome AS nomeFantasia,
    DATE_FORMAT(a.dataInicio, '%d/%m/%Y') AS dataInicio,
    DATE_FORMAT(a.dataInicio, '%H:%i:%s') AS horaInicio,
    DATE_FORMAT(a.dataFim, '%d/%m/%Y') AS dataFim,
    DATE_FORMAT(a.dataFim, '%H:%i:%s') AS horaFim    
FROM recebimentomp AS a
LEFT JOIN profissional AS b ON (a.abreProfissionalID = b.profissionalID)
LEFT JOIN profissional AS c ON (a.aprovaProfissionalID = c.profissionalID)
LEFT JOIN profissional AS d ON (a.finalizaProfissionalID = d.profissionalID)
LEFT JOIN fornecedor AS e ON (a.fornecedorID = e.fornecedorID)

WHERE a.recebimentoMpID = ?;
`
    const [resultSqlRecebimentoMp] = await db.promise().query(sqlRecebimentoMp, [data.recebimentoMpID])
    const resultData = resultSqlRecebimentoMp[0]
    const modelo = resultData.parRecebimentoMpModeloID

    const header = [
        {
            'name': 'Data Inicio',
            'value': resultData.dataInicio
        },
        {
            'name': 'Data Fim',
            'value': resultData.dataFim
        },
        {
            'name': 'Hora Inicio',
            'value': resultData.horaInicio
        },
        {
            'name': 'Hora Fim',
            'value': resultData.horaFim
        },
        {
            'name': 'Nome Fantasia',
            'value': resultData.nomeFantasia
        },
        {
            'name': 'Abre Profissional',
            'value': resultData.abreProfissional
        },
        {
            'name': 'Finaliza Profissional',
            'value': resultData.finalizaProfissional
        },
        {
            'name': 'Aprova Profissional',
            'value': resultData.aprovaProfissional
        },
        {
            'name': 'Nome Fantasia',
            'value': resultData.nomeFantasia
        },
        {
            'name': 'CNPJ',
            'value': resultData.cnpj
        },
        {
            'email': 'Email',
            'value': resultData.email
        },
        {
            'name': 'Observação',
            'value': resultData.obs,
        },
        {
            'name': 'CEP',
            'value': resultData.cep

        },
        {
            'name': 'Rua',
            'value': resultData.logradouro
        },
        {
            'name': 'Numero',
            'value': resultData.numero
        },
        {
            'name': 'Complemento',
            'value': resultData.complemento
        },
        {
            'name': 'Bairro',
            'value': resultData.bairro
        },
        {
            'name': 'Municipio',
            'value': resultData.cidade
        },
        {
            'name': 'UF',
            'value': resultData.estado
        },
        {
            'name': 'DYNAMIC',
            'value': 'TESTEEEE'
        },

    ]


    const values = {
        header,

    };


    return values
}

module.exports = dynamic 