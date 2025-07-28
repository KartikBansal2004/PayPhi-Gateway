const mysql = require("mysql2");

const pool = mysql.createPool({
host: "localhost",
user: "root",
password: "ppc8r8822",
database: "payment_gateway",
});


module.exports = pool.promise();
