// ==============================================================================
// Set Dependencies & Required Files
// ==============================================================================

var inquirer = require("inquirer");
var Table = require("cli-table2");

var database = require('./database/database.js');
var dbConnect = require('./database/dbconnect.js');

// ==============================================================================
// create the table for displaying products
// establish global variables
// ==============================================================================

var table = new Table({
    head: ['Item', 'Product', 'Department', 'Price'],
    colWidths: [8, 25, 12, 8]
});

var availableProducts = [];

// ==============================================================================
// App Functions
// ==============================================================================

function welcomeCustomer() {
    
    // display the welcome message
    console.log("\nWelcome to Bamazon!  Here are the items we currently have available: \n");

    // connect to the database
    dbConnect();

    // call displayProducts to display the available products
    displayProducts();
}

function displayProducts() {

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
            message: " What is the item number of what you would like to buy?",
            name: "itemNumber"
        },
    ]).then(function(response){

        // convert the response to an integer
        var productWanted = parseInt(response.itemNumber);

        // check if the response is in the availableProducts array
        if (availableProducts.includes(productWanted)) {

            // get the number in stock of the item
            getItemQuantity(productWanted);
            
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
            message: " We have " + product.stock_quantity + ' in stock. How many would you like?',
            name: "quantityWanted"
        }
    ]).then(function(response) {

        // store the quantity wanted
        var quantityWanted = parseInt(response.quantityWanted);

        // check to make sure the quantity wanted is greater than 0 and less than the amount in stock
        if (quantityWanted > 0 && quantityWanted <= product.stock_quantity) {

            // calculate the order total -- converts to a string
            var orderTotal = (quantityWanted * product.price).toFixed(2);

            // display the order total
            console.log("Your total is $" + orderTotal + ".  Thank you for shopping at Bamazon!");

            // calculate the remaining stock
            var stockLeft = product.stock_quantity - quantityWanted;

            // call the function to update the quantity in stock
            updateStock(product.item_id, stockLeft, parseFloat(orderTotal));

        } else {
            
             // display that we cannot fill that order
             console.log("I'm sorry, we can't fill that order. You should try Walmart.");

             // end the database connection
             database.end();
        }
    });
}

function updateStock(id, newSupply, orderTotal) {

    database.query('SELECT product_sales FROM products WHERE item_id=?', id, function(err, res) {
        if (err) throw err;

        // store the current sales
        var currentSales = res[0].product_sales;

        // calculate the new sales
        var newTotalSales = currentSales + orderTotal;

        // update the stock quantity with the new amount and update the product_sales
        database.query(
            'UPDATE products SET ?, ? WHERE ?', 
            [
                { stock_quantity: newSupply },
                { product_sales: newTotalSales },
                { item_id: id }
            ],
            function(err, res) {
                if (err) throw err;

                // end the database connection
                database.end();
            }
        );
    });
}

// ==============================================================================
// Start App
// ==============================================================================

welcomeCustomer();