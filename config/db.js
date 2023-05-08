require('dotenv/config')
const mysql2 = require("mysql2");

console.log('Server rodando...')

const db = mysql2.createConnection({

    // 'host': '189.113.13.186',
    // 'user': 'sispreci_sisprecisacom',
    // 'password': 'rwSMx1G4w0TQqt#m^h^SJj3Ay9SgSq&rY4y',
    // 'database': 'sisprecisacom_ged_nutrivital',

    'host': '177.234.154.35',
    'user': 'gedagroc_user',
    'password': 'Jw6!Jr0+Vw4+Lc8#',
    'database': 'gedagroc_ged',

    // 'host': 'localhost',
    // 'user': 'root',
    // 'password': '',
    // 'database': 'gedagroc_ged',

    // 'host': process.env.DB_HOST,
    // 'user': process.env.DB_USER,
    // 'password': process.env.DB_PASSWORD,
    // 'database': process.env.DB_DATABASE,
});

module.exports = db;
