const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ppc8r8822",
  database: "payment_gateway",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL database");
});

module.exports = db;
