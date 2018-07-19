// ==============================================================================
// Set Dependencies
// ==============================================================================

var mysql = require("mysql");

// ==============================================================================
// Establish Database Connection
// ==============================================================================

var database = mysql.createConnection({
    host: "localhost",
    port:  3306,
    user: "root",

    password: "root",
    database: "bamazon"
});

module.exports = database;