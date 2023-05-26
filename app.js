const express = require('express');
const cors = require('cors');
<<<<<<< HEAD

=======
>>>>>>> f971d8a2c4fa786a6d96932acd3c0bf62f6003f5
const app = express();

const routes = require("./routes");
const routerReports = require("./reports");

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(routes);
app.use(routerReports);

<<<<<<< HEAD
// Rota para fornecer o arquivo PDF do relatório
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
=======
app.listen(3333, (req, res) => {
    console.log('Server is running on port 3333');
>>>>>>> f971d8a2c4fa786a6d96932acd3c0bf62f6003f5
});
