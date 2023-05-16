const nodemailer = require('nodemailer');

const SendMailConfig = async (destinatario, assunto, html) => {

    const transporter = nodemailer.createTransport({
        host: 'mail.gedagro.com.br',
        port: 587,
        secure: false,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: 'app@gedagro.com.br',
            pass: 'Jw6!Jr0+Vw4+Lc8#'
        }
    });

    const mailOptions = {
        from: 'Gedagro <app@gedagro.com.br>',
        to: destinatario,
        subject: assunto,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(500).json(error);
        } else {
            console.log('Email enviado: ' + info.response);
            res.status(200).json(info.response);
        }
    });
};

module.exports = SendMailConfig;