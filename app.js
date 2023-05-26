const express = require('express');
const cors = require('cors');

const app = express();
const port = 3333;

app.use(express.json());
app.use(cors());

// Rota para fornecer o arquivo PDF do relatório
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
