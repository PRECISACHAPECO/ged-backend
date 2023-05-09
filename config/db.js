require('dotenv/config')
const mysql2 = require("mysql2");

console.log('Server rodando...')

const db = mysql2.createConnection({
    'host': process.env.DB_HOST,
    'user': process.env.DB_USER,
    'password': process.env.DB_PASSWORD,
    'database': process.env.DB_DATABASE,

    // 'host': 'localhost', //process.env.DB_HOST,
    // 'user': 'gedagroc_user', //process.env.DB_USER,
    // 'password': 'Jw6!Jr0+Vw4+Lc8#', //process.env.DB_PASSWORD,
    // 'database': 'gedagroc_ged', //process.env.DB_DATABASE,
});

module.exports = db;
