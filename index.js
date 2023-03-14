const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'u296765781_john_finance',
    
    host: '189.113.13.186',
    user: 'sispreci_sisprecisacom',
    password: 'rwSMx1G4w0TQqt#m^h^SJj3Ay9SgSq&rY4y',
    database: 'sisprecisacom_ged_nutrivital',
});

app.get('/register', (request, response) => {
    connection.query(
        'SELECT * FROM users',
        function (err, results) {
            response.send(results);
        }
    );
});

app.post('/register', (request, response) => {
    const name = request.body.name;
    connection.query(
        'INSERT INTO users (name) VALUES (?)',
        [name],
        function (err, results) {
            response.send(results);
        }
    );
});

app.listen(3333, () => {
    console.log('Server started on port 3333!');
});