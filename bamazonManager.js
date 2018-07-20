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

var lowInventoryLimit = 5;

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
            addInventoryPrompt();
            break;
        case "Add New Product":
            addNewProductPrompt();
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
    database.query("SELECT * FROM products WHERE stock_quantity < ?", lowInventoryLimit, function(err, res) {
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
                    "Here are all the products with an inventory less than: " + lowInventoryLimit + "\n\n");

        console.log(table.toString());

        // ask the user if they would like to do something else
        continuePrompt();
    });
}

function addInventoryPrompt() {

    inquirer.prompt([
        {
            type: "input",
            message: " What is the item number you would like to add inventory to?",
            name: "itemNumber"
        },
        {
            type: "input",
            message: " How many would you like to add to stock?",
            name: "stockAdded"
        }
    ]).then(function(inquirerResponse) {

        // convert the responses to integers
        var productID = parseInt(inquirerResponse.itemNumber);
        var stockAdded = parseInt(inquirerResponse.stockAdded);

        if (productID > 0 && stockAdded > 0) {

            // call the addInventory function
            addInventory(productID, stockAdded);

        } else {
            
            // display that the entry is not valid
            console.log("I'm sorry, that is not a valid choice");

            // run the prompt again
            addInventoryPrompt();
        }
    });
}

function addInventory(id, stockAdded) {

    database.query('SELECT stock_quantity FROM products WHERE item_id=?', id, function (err, res) {
        if (err) throw err;

        // test if the response is empty
        if (res.length === 0) {

            console.log("\nYou entered an invalid item number. Please try again\n");

            //run the prompt again
            addInventoryPrompt();
        } else {

            // store the current stock number
            var currentStock = res[0].stock_quantity; 

            // calculate the new stock number
            var newStock = currentStock + stockAdded;

            // update the database to set the new stock number
            database.query(
                'UPDATE products SET ? WHERE ?', 
                [
                    { stock_quantity: newStock },
                    { item_id: id}
                ], 
                function(err, res) {
                    if (err) throw err;

                    // display that the item's stock was increased
                    console.log("You have increased item " + id +"'s stock quantity by " + stockAdded);

                    // ask the user if they would like to do something else
                    continuePrompt();
                }
            );
        }
    });
}

function addNewProductPrompt() {

    inquirer.prompt([
        {
            type: "input",
            message: "What is the item name?",
            name: "itemName"
        },        
        {
            type: "input",
            message: "What department is the item for?",
            name: "department"
        },
        {
            type: "input",
            message: "What is the item's price?",
            name: "price"
        },
        {
            type: "input",
            message: "How many are we adding in stock?",
            name: "stock"
        }
    ]).then(function(inquirerResponse) {

        // convert the price and stock to numbers
        var price = parseFloat(inquirerResponse.price);
        var stock = parseInt(inquirerResponse.stock);

        // call the addNewProduct function
        addNewProduct(inquirerResponse.itemName, inquirerResponse.department, price, stock);
    });
}

function addNewProduct(name, dept, price, stock) {

    // add the item to the database
    database.query(
        'INSERT INTO products SET ?',
        {
            product_name: name,
            department_name: dept,
            price: price,
            stock_quantity: stock
        },
        function (err, res) {
            if (err) throw err;

            // output a success message
            console.log(res.affectedRows + " item added successfully!\n")

            // ask the user if they would like to do something else
            continuePrompt();
        }
    );
}

// ==============================================================================
// Start App
// ==============================================================================

console.log("\nWelcome Bamazon Manager!")
managerOptionsPrompt();