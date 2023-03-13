const express = require('express');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: '89.117.7.204',
    user: 'u296765781_john',
    password: '28Liverpo@@',
    database: 'u296765781_john_finance'
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