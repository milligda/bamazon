// ==============================================================================
// Set Dependencies & Required Files
// ==============================================================================

var inquirer = require("inquirer");
var Table = require("cli-table2");

var database = require('./database/database.js');
var dbConnect = require('./database/dbconnect.js');

// ==============================================================================
// create the table for displaying departments
// ==============================================================================

var table = new Table({
    head: ['Department ID', 'Name', 'Overhead', 'Dept Sales', 'Dept Profit'],
    colWidths: [15, 15, 10, 12, 14]
});

// ==============================================================================
// App Functions
// ==============================================================================

function supervisorOptionsPrompt() {

    inquirer.prompt([
        {
            type: "list",
            message: "Here are your available options:",
            choices: ["View Sales By Department", "Create New Department"],
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
            supervisorOptionsPrompt();

        // if no, say goodbye and close the database
        } else {
            console.log("Goodbye.");
            database.end();
        }
    });
}

function determineAction(selection) {

    // connect to the database
    dbConnect();

    // call the appropriate function depending on the user's selection
    switch(selection) {
        case "View Sales By Department":
            displayDepartments();
            break;
        case "Create New Department":
            addNewDeptPrompt();
            break;
        default:
            console.log("You have selected an invalid option");
    }
}

function displayDepartments() {

    // SQL query
    var deptQuery = "SELECT d.department_id, d.department_name, d.overhead_costs, SUM (p.product_sales) ";
    deptQuery += "FROM products p RIGHT JOIN departments d ON p.department_name = d.department_name ";
    deptQuery += "GROUP BY d.department_name ORDER BY d.department_id";

    // query the database
    database.query(deptQuery, function (err, res) {
        if (err) throw err;

        // clear the table
        table.splice(0, table.length);

        // add the products to the display table
        for (var i = 0; i < res.length; i++) {

            // store the overhead and dept sales as variables
            var deptOverhead = res[i].overhead_costs; 
            var deptSales = res[i]['SUM (p.product_sales)'];

            // check if either variable is null
            if (deptOverhead == null) { deptOverhead = 0 };
            if (deptSales == null) { deptSales = 0; };

            // calculate the department profit
            var deptProfit = deptSales - deptOverhead;

            // add the department details to the table
            table.push([
                res[i].department_id,
                res[i].department_name,
                deptOverhead.toFixed(2),
                deptSales.toFixed(2),
                deptProfit.toFixed(2),
            ]);
        };

        // display the table
        console.log(table.toString());

        // Call the function asking the user if they would like to do something else
        continuePrompt();
    });
}

function addNewDeptPrompt() {

    inquirer.prompt([
        {
            type: "input",
            message: "What is the department name?",
            name: "deptName"
        },        
        {
            type: "input",
            message: "What is the department's projected overhead?",
            name: "overhead"
        }
    ]).then(function(inquirerResponse) {

        // convert the price and stock to numbers
        var overhead = parseFloat(inquirerResponse.overhead);

        // call the addNewDept function
        addNewDept(inquirerResponse.deptName, overhead);
    });
}

function addNewDept(name, overhead) {

    // add the department to the database
    database.query(
        'INSERT INTO departments SET ?',
        {
            department_name: name,
            overhead_costs: overhead
        },
        function (err, res) {
            if (err) throw err;

            // output a success message
            console.log(res.affectedRows + " department added successfully!\n")

            // ask the user if they would like to do something else
            continuePrompt();
        }
    );
}

// ==============================================================================
// Start App
// ==============================================================================

console.log("\nWelcome Bamazon Supervisor!");
supervisorOptionsPrompt();