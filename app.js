const express = require('express');
const cors = require('cors');
const app = express();
const puppeteer = require('puppeteer');
const pdf = require('html-pdf');


const routes = require("./routes");
const routerReports = require("./reports");

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(routes);
app.use(routerReports);


app.get('/api/relatorio', (req, res) => {
    const content = `
    <div style="display: flex">
        <h1>Conteúdo do PDF</h1>
        <h1>Conteúdo do PDF</h1>
    </div>
    `;

    pdf.create(content).toStream((err, stream) => {
        if (err) {
            console.error('Erro ao gerar o PDF:', err);
            res.status(500).send('Erro ao gerar o PDF');
            return;
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=relatorio.pdf');

        stream.pipe(res);
    });
});

// Rota para fornecer o arquivo PDF do relatório
app.listen(3333, () => {
    console.log(`Server is running on port 3333`);
});
