const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "qmsadmin",
  password: "qmspassword",
  database: "dbqms",
});

module.exports = db;
