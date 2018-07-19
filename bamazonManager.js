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
    head: ['Item', 'Product', 'Department', 'Price', 'Stock'],
    colWidths: [8, 25, 12, 8, 8]
});

var lowInventoryLimit = 20;

// ==============================================================================
// App Functions
// ==============================================================================

function managerOptionsPrompt() {

    inquirer.prompt([
        {
            type: "list",
            message: "Here are your available options:",
            choices: ["View All Inventory", "View Low Inventory", "Add to Inventory", "Add New Product"],
            name: "choice"
        }
    ]).then(function(inquirerResponse){

        determineAction(inquirerResponse.choice);
    });
}

function continuePrompt() {

    inquirer.prompt([
        {
            type: "list",
            message: "Would you like to do something else?",
            choices: ["Yes", "No"],
            name: "choice"
        }
    ]).then(function(inquirerResponse) {

        // if yes, display the manager options again
        if (inquirerResponse.choice === "Yes") {
            managerOptionsPrompt();

        // if no, say goodbye and close the database
        } else {
            console.log("Goodbye.");
            database.end();
        }
    });
}

function determineAction(selection) {

    // connect to the database
    dbConnect;

    // call the appropriate function depending on the user's selection
    switch(selection) {
        case "View All Inventory":
            displayInventory();
            break;
        case "View Low Inventory":
            displayLowInventory();
            break;
        case "Add to Inventory":
            // addInventory();
            break;
        case "Add New Product":
            // addNewProduct();
            break;
        default:
            console.log("You have selected an invalid option");
    }
}

function displayInventory() {

    // get all products from the database
    database.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        // clear the product table
        table.splice(0, table.length);

        // add the products to the display table
        for (var i = 0; i < res.length; i++) {

            // set the price to 2 decimal places
            var price = res[i].price.toFixed(2); 

            // add the item to the table
            table.push([
                res[i].item_id,
                res[i].product_name,
                res[i].department_name,
                price,
                res[i].stock_quantity,
            ]);
        };

        // display the products table
        console.log(table.toString());

        // Call the function asking the user if they would like to do something else
        continuePrompt();
    });
}

function displayLowInventory() {

    // get all products from the database with stock levels less than the lowInventoryLimit
    database.query("SELECT * FROM products WHERE stock_quantity <= ?", lowInventoryLimit, function(err, res) {
        if (err) throw err;

        // clear the product table
        table.splice(0, table.length);

        // add the products to the display table
        for (var i = 0; i < res.length; i++) {

            // set the price to 2 decimal places
            var price = res[i].price.toFixed(2); 

            // add the item to the table
            table.push([
                res[i].item_id,
                res[i].product_name,
                res[i].department_name,
                price,
                res[i].stock_quantity,
            ]);
        };

        // display the products table

        console.log("\n\n**************************************************\n" + 
                    "Here are all the low inventory products:\n\n");

        console.log(table.toString());

        // Call the function asking the user if they would like to do something else
        continuePrompt();

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

        console.log(productWanted);

        // check if the response is in the availableProducts array
        if (availableProducts.includes(productWanted)) {

            // connect to the database
            // dbConnect;

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
        if (quantityWanted > 0 && quantityWanted < product.stock_quantity) {

            // calculate the order total
            var orderTotal = (quantityWanted * product.price).toFixed(2);

            // display the order total
            console.log("Your total is $" + orderTotal + ".  Thank you for shopping at Bamazon!");

            // calculate the remaining stock
            var stockLeft = product.stock_quantity - quantityWanted;

            // call the function to update the quantity in stock
            updateStock(product.item_id, stockLeft);

        } else {
            
             // display that we cannot fill that order
             console.log("I'm sorry, we can't fill that order. You should try Walmart.");

             // end the database connection
             database.end();
        }
    });
}

function updateStock(id, newSupply) {

    // update the stock quantity with the new amount
    database.query('UPDATE products SET ? WHERE ?', 
    [
        { stock_quantity: newSupply },
        { item_id: id }
    ],
    function(err, res) {
        if (err) throw err;

        // end the database connection
        database.end();
    }
    );
}

// ==============================================================================
// Start App
// ==============================================================================

console.log("\nWelcome Bamazon Manager!")
managerOptionsPrompt();