// Set the dependencies
var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table2");

// create the table for displaying products
var table = new Table({
    head: ['Item', 'Product', 'Department', 'Price'],
    colWidths: [8, 25, 12, 8]
});

// set up the database connection
var database = mysql.createConnection({
    host: "localhost",
    port:  3306,
    user: "root",

    password: "root",
    database: "bamazon"
});

// connect to the database
function connectDB() {
    database.connect(function(err) {
        
        // display any connection error messages
        if (err) throw err;
    });
}

// function for display inventory in the table
function displayInventory() {

    // get the products from the database
    database.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        // add the products to the display table
        for (var i = 0; i < res.length; i++) {

            // set the price to 2 decimal places
            var price = res[i].price.toFixed(2); 

            table.push([
                res[i].item_id,
                res[i].product_name,
                res[i].department_name,
                price
            ]);
        };

        // display the products table
        console.log(table.toString());

        // close the database connection

        // ask the customer what they would like to 

    });
}

function welcomeCustomer() {
    
    // connect to the database
    connectDB();

    // display the welcome message
    var welcomeMessage = "\nWelcome to Bamazon!  Here are the items we currently have available: \n"
    console.log(welcomeMessage);

    // call displayInventory to display the current inventory
    displayInventory();
}

// when the app starts, call welcomeCustomer
welcomeCustomer();