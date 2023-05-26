const pdf = require('html-pdf');
const { generateContent } = require('./content');

async function reportFornecedor(req, res) {
    const { fornecedorID, unidadeID } = req.query;


    const content = '<h1>Teste</h1>'
    //? Define as margens do PDF
    const styledContent = `
        <style>
            @page {
                margin: 4cm; 
            }
        </style>
        ${content}
    `;

    pdf.create(styledContent).toBuffer((err, buffer) => {
        if (err) {
            console.error('Erro ao gerar relatório:', err);
            res.status(500).send('Erro ao gerar relatório');
            return;
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');
        res.send(buffer);
    });
}

module.exports = { reportFornecedor };