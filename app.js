const express = require('express');
const cors = require('cors');
const app = express();


const routes = require("./routes");
const routerReports = require("./reports");

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(routes);
app.use(routerReports);

app.get('/report', (req, res) => {
    const invoiceData = {
        nome: 'Fornecedor 1',
        cnpj: '123456789',
        dataAvaliacao: '2021-01-01',
        status: 'Aprovado',
        observacao: 'Observação do fornecedor 1',
    };
    if (invoiceData) {
        res.status(200).json(invoiceData);
    } else {
        res.status(404).json({ message: 'Unable to find the requested invoice!' });
    }
});



// Rota para fornecer o arquivo PDF do relatório
app.listen(3333, () => {
    console.log(`Server is running on port 3333`);
});
