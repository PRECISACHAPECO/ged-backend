const pdf = require('html-pdf');
const { generateContent } = require('./content');

async function teste(req, res) {
    let nome = "jONATAN"
    const content = await generateContent(nome);

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

module.exports = { teste };