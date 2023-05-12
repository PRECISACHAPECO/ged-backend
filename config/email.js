const nodemailer = require('nodemailer');

// configure o transporte do nodemailer com suas credenciais de email
const transporter = nodemailer.createTransport({
    host: 'sisprecisa.com.br',
    port: 587,
    auth: {
        user: 'suporte@sisprecisa.com.br',
        pass: '5extQ8uF06'
    }
})

// configure as opções do email
const mailOptions = {
    from: 'roberto.delavy@gmail.com',
    to: 'roberto.delavy@gmail.com',
    subject: 'Assunto do Email...',
    html: MyEmail.render() // renderiza o conteúdo HTML do email
}

// envia o email
transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error)
    } else {
        console.log('Email enviado: ' + info.response)
    }
})
