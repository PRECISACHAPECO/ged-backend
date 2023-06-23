const express = require('express');
const cors = require('cors');
const app = express();
const routes = require("./routes");
const routerReports = require("./reports");
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(routes);
app.use(routerReports);
app.use('/api/uploads', express.static('uploads'));

const pdf = require('html-pdf');
const fs = require('fs');

app.get('/api/gerar-relatorio', (req, res) => {
    const html = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap');

        .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .report-table th, .report-table td {
            border: 1px solid black;
            padding: 8px;
        }
        
        .report-table thead {
            background-color: #f2f2f2;
        }
        
        .report-title {
            margin-top: 20px;
            font-family: 'Poppins', sans-serif;
        }
    </style>
    <h1 class="report-title">Relatório</h1>
    <table class="report-table">
        <thead>
            <tr>
                <th>Nome</th>
                <th>Idade</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>João</td>
                <td>30</td>
            </tr>
            <tr>
                <td>Maria</td>
                <td>25</td>
            </tr>
        </tbody>
    </table>
`;


    // Gere o PDF a partir do HTML
    pdf.create(html).toStream((err, stream) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao gerar o PDF');
        } else {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

            // Envie o relatório PDF como resposta
            stream.pipe(res);
        }
    });
});

app.listen(3333, () => {
    console.log('Server is running on port 3333');
});
