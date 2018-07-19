// Set the dependencies
var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table2");

// create the table for displaying products
var table = new Table({
    head: ['Item', 'Product', 'Department', 'Price'],
    colWidths: [8, 25, 12, 8]
});

// set the global variables
var availableProducts = [];

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

// close the database connection
function closeDB() {
    database.end();
}

// initial function that welcomes the customer
function welcomeCustomer() {
    
    // connect to the database
    connectDB();

    // display the welcome message
    var welcomeMessage = "\nWelcome to Bamazon!  Here are the items we currently have available: \n"
    console.log(welcomeMessage);

    // call displayInventory to display the current inventory
    displayInventory();
}

// function for display inventory in the table
function displayInventory() {

    // get the products from the database
    database.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        // clear out the available products array
        availableProducts = [];

        // add the products to the display table
        for (var i = 0; i < res.length; i++) {

            // set the price to 2 decimal places
            var price = res[i].price.toFixed(2); 

            // check if the item is in stock 
            if (res[i].stock_quantity > 0) {

                // add the item to the table
                table.push([
                    res[i].item_id,
                    res[i].product_name,
                    res[i].department_name,
                    price
                ]);

                // add the item number to the available products array
                availableProducts.push(res[i].item_id);
            }
        };

        // close the database
        // closeDB();

        // display the products table
        console.log(table.toString());

        // Call the function asking the user what item they would like to purchase
        purchaseItemPrompt();

    });
}

function purchaseItemPrompt() {

    inquirer.prompt([
        {
            type: "input",
            message: "\nWhat is the item number of what you would like to buy?",
            name: "itemNumber"
        },
    ]).then(function(response){

        // convert the response to an integer
        var productWanted = parseInt(response.itemNumber);

        console.log(productWanted);

        // check if the response is in the availableProducts array
        if (availableProducts.includes(productWanted)) {

            // connect to the database
            // connectDB();

            // get the number in stock of the item
            getItemQuantity(productWanted);
            
            // call the function asking the user how many they would like to buy
            // quantityPrompt(productWanted);

        } else {

            // display that the entry is not valid
            console.log("I'm sorry, that isn't a valid choice");

            // run the prompt again
            purchaseItemPrompt();
        }
    });
}

function getItemQuantity(productWanted) {

    // get the stock quantity for the item
    database.query('SELECT * FROM products WHERE item_id=?', productWanted, function (err, res) {
        if (err) throw err;

        // store the product response in a variable
        var product = res[0];

        // call the quantityPrompt function
        quantityPrompt(product);
    });
}

function quantityPrompt(product) {

    inquirer.prompt([
        {
            type: "input",
            message: "\n We have " + product.stock_quantity + ' in stock. How many would you like?',
            name: "quantityWanted"
        }
    ]).then(function(response) {

        // store the quantity wanted
        var quantityWanted = parseInt(response.quantityWanted);

        // check to make sure the quantity wanted is greater than 0 and less than the amount in stock
        if (quantityWanted > 0 && quantityWanted < product.stock_quantity) {

            // calculate the order total
            var orderTotal = (quantityWanted * product.price).toFixed(2);

            // display the order total
            console.log("Your total is $" + orderTotal + ".  Thank you for shopping at Bamazon!");

            // call the function to update the quantity in stock -- PASS IN THE QUANTITY PURCHASED AND THE ITEM ID


        } else {
            
             // display that we cannot fill that order
             console.log("I'm sorry, we can't fill that order. You should try Walmart, they're dumb enough to carry everything!");

             // run the prompt again
             closeDB();
        }
    });
}

// when the app starts, call welcomeCustomer
welcomeCustomer();