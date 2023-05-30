const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db');

const routes = require("./routes");
const routerReports = require("./reports");

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(routes);
app.use(routerReports);

app.get('/api/report', (req, res) => {
    async function getReport() {
        const sql = `SELECT * FROM usuario`;
        const [result] = await db.promise().query(sql)
        return res.json(result)
    }
    getReport()
});



// Rota para fornecer o arquivo PDF do relatório
app.listen(3333, () => {
    console.log(`Server is running on port 3333`);
});
