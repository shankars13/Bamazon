//Required npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var chalk = require('chalk');

//mysql database and sql server 
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Mysqpass!1",
  database: "bamazon"
});

//make connection to sql server and database. call function to display options
connection.connect(function(err) {
  if (err) throw err;
  console.log();
  console.log(chalk.yellow('			B A M A Z O N   S U P E R V I S O R'));
  console.log();
  displayOptions();
});

//Dispaly list of options for the Manager
function displayOptions() {
	inquirer
	.prompt({
		name: "action",
		type: "list",
		message: "What would you like to do ?",
		choices: [
		 "View Products Sales by Department",
		 "Create New Department",
		 "Exit"
		]
	})
	.then(function(answer) {
		switch (answer.action) {

		  case "View Products Sales by Department" :
			  	prodSalesByDept();
			  	break;

		  case "Create New Department" :
			  	addNewDept();
		  		break;

		  case "Exit" :
		  		connection.end();
		  		break;
		}
	});
}

//List Product sales by department. Join of products and department table
function prodSalesByDept() {
	var table = new Table({
	    head: ['DEPARTMENT ID', 'DEPARTMENT NAME', 'OVER-HEAD COSTS', 'PRODUCT SALES', 'PROFIT']
	});	

	var query = "SELECT department_id, department.department_name, over_head_costs,SUM(product_sales) as tot_prod_sales,(SUM(product_sales)-over_head_costs) as profit FROM department, products WHERE department.department_name = products.department_name GROUP BY department.department_name"
	connection.query(query, function(err, res){
		if (err) throw err;

		for (var i = 0; i<res.length; i++) {
			// console.log(res[i]);
			table.push( [res[i].department_id, res[i].department_name, res[i].over_head_costs,res[i].tot_prod_sales, res[i].profit] );
		}

		console.log();
		console.log(chalk.blue('	     		BAMAZON PRODUCT SALES BY DEPARTMENT'));
		console.log(chalk.blue('    	 		~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'));
		console.log(table.toString());
		console.log();
		displayOptions();
		
		// connection.end();
	});
}

//Create new Department and add it to the department table
function addNewDept() {
	console.log();
	console.log(chalk.blue('     			CREATE NEW DEPARTMENT'));
	console.log(chalk.blue('     			~~~~~~~~~~~~~~~~~~~~~'));
	console.log();

	inquirer.prompt([
	{
		name: "input_dept",
		type: "input",
		message: "Enter Department name to add :",
		validate: function (data) {
			if (!data)
				return "Data cannot be empty..";
			else
				return true;
			}
	},
	{
		name: "input_costs",
		type: "input",
		message: "Enter Over-head Costs for the Department :",
		validate: function(value) {
			if (isNaN(value) === false) {
				return true;
			}
			return false;
		}
	  }
	])
	.then(function(answer) {
		connection.query("INSERT INTO department SET ?", 
		[
			{
				department_name:answer.input_dept,
				over_head_costs:answer.input_costs
			}
		],
		function(err, res){
			if (err) throw err;

		console.log();
		console.log(chalk.red.bold('	New Department Created ...'));
		console.log();
		displayOptions();
		});		
	})	
}