const mysql2 = require("mysql2");




const db = mysql2.createConnection({
    'host': '189.113.13.186', // process.env.MYSQL_HOST,
    'user': 'sispreci_sisprecisacom', //process.env.MYSQL_USER,
    'password': 'rwSMx1G4w0TQqt#m^h^SJj3Ay9SgSq&rY4y', //process.env.MYSQL_PASSWORD,
    'database': 'sisprecisacom_ged_nutrivital', //process.env.MYSQL_DATABASE,
});

module.exports = db;
