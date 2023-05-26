const express = require('express');
const cors = require('cors');
const app = express();
const routes = require("./routes");
const routerReports = require("./reports");
app.use(express.json());
app.use(cors());
app.use(routes);
app.use(routerReports);
const PDFDocument = require('pdfkit');
const pdf = require('html-pdf');


app.get('/gerar-relatorio', (req, res) => {
    // Código para gerar o relatório usando html-pdf
    const content = '<h1 style={{color: "red"}}>Meu Relatório</h1><p>Conteúdo do relatório em HTML.</p>';

    pdf.create(content).toBuffer((err, buffer) => {
        if (err) {
            console.error('Erro ao gerar relatório:', err);
            res.status(500).send('Erro ao gerar relatório');
            return;
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');
        res.send(buffer);
    });
});



app.listen(3333, (req, res) => {
    console.log('Server is running on port 3333');
});


