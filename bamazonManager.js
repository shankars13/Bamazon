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
  console.log(chalk.yellow('	B A M A Z O N   M A N A G E R'));
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
		 "View Products for Sale",
		 "View Low Inventory",
		 "Add to Inventory",
		 "Add New Product",
		 "Exit"
		]
	})
	.then(function(answer) {
		switch (answer.action) {

		  case "View Products for Sale" :
			  	viewProducts();
			  	break;

		  case "View Low Inventory" :
			  	viewLowInventory();
		  		break;

		  case "Add to Inventory" :
			  	addToInventory();
			  	break;

		  case "Add New Product" :
			  	console.log("	Add New Product");
		  		addNewProduct();
		  		break;

		  case "Exit" :
		  		connection.end();
		  		break;
		}
	});
}

//View products in the products table with quantity
function viewProducts() {
	var table = new Table({
	    head: ['ITEM ID', 'PRODUCT NAME', 'PRICE', 'QUANTITY']
	});	

	var query = "SELECT item_id, product_name, price,stock_quantity FROM products"
	connection.query(query, function(err, res){
		if (err) throw err;

		for (var i = 0; i<res.length; i++) {
			table.push( [res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity] );
		}

		console.log();
		console.log(chalk.blue('     BAMAZON VIEW PRODUCTS'));
		console.log(chalk.blue('     ~~~~~~~~~~~~~~~~~~~~~'));
		console.log(table.toString());
		console.log();
		displayOptions();
		
	});
}

//View Products with stock quantity less than 5 in the inventory 
function viewLowInventory() {

	var lowTable = new Table({
	    head: ['ITEM ID', 'PRODUCT NAME', 'PRICE', 'QUANTITY']
	});

	var query = "SELECT item_id, product_name, price,stock_quantity FROM products WHERE stock_quantity < 5"
	connection.query(query, function(err, res){
		if (err) throw err;

		for (var i = 0; i<res.length; i++) {
			lowTable.push( [res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity] );
		}

		console.log();
		console.log(chalk.blue('     BAMAZON LOW INVENTORY'));
		console.log(chalk.blue('     ~~~~~~~~~~~~~~~~~~~~~'));
		console.log(lowTable.toString());
		console.log();
		displayOptions();
	});
}

//Manager can add products to the Inventory
function addToInventory() {

	var addTable = new Table({
	    head: ['ITEM ID', 'PRODUCT NAME', 'PRICE', 'QUANTITY']
	});
	var query = "SELECT item_id, product_name, price,stock_quantity FROM products"
	connection.query(query, function(err, res){
		if (err) throw err;

		for (var i = 0; i<res.length; i++) {
			addTable.push( [res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity] );
		}

		console.log();
		console.log(chalk.blue('     BAMAZON ADD TO INVENTORY'));
		console.log(chalk.blue('     ~~~~~~~~~~~~~~~~~~~~~~~~'));

		console.log(addTable.toString());

		getUserInput();
	})
}

//Get user input of Item Id and Quantity
function getUserInput() {
	inquirer.prompt([
	{
		name: "input_id",
		type: "input",
		message: "Enter ITEM ID# to add :",
		validate: function(value) {
			if (isNaN(value) === false) {
				return true;
			}
			return false;
		}
	  },
	  {
	  	name: "input_qty",
	  	type: "input",
	  	message: "Enter quantity to add : ",
	  	validate: function(value) {
	  		if (isNaN(value) === false) {
	  			return true;
	  		}
	  		return false;
	  	}
	  }
	])
	.then(function(answer) {
		var query = "SELECT item_id, stock_quantity FROM products WHERE ?"
		
		connection.query(query, {item_id:answer.input_id},function(err,res){

		if (parseInt(answer.input_qty) >=  0) {
			// console.log('Order can be placed');
			var new_qty = res[0].stock_quantity + parseInt(answer.input_qty);
			updateStockQuantity(answer.input_id,new_qty);
			console.log(chalk.red.bold('	Inventory added... '));
		}
		else {
			console.log(chalk.red.bold("	 Quantity cannot be less than 0.."));
		} 
		displayOptions();
		})
	})

}

//Update the stock quantity for the product with quantity
function updateStockQuantity(prod_id,prod_qty) {
	connection.query("UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: prod_qty
			},
			{
				item_id: prod_id
			}
		],
		function(err, res){
			if (err) throw err;

	});
}

//Add new Product to the inventory
function addNewProduct() {

	var deptName = [];
	console.log();
	console.log(chalk.blue('     ADD NEW PRODUCT'));
	console.log(chalk.blue('     ~~~~~~~~~~~~~~~'));
	console.log();
	
	var query = "SELECT department_name FROM department"
	connection.query(query, function(err, res){
		if (err) throw err;
		// console.log('res : ' + res)

		for (var i = 0; i<res.length; i++) {
			// console.log(res[i].department_name);
			deptName.push(res[i].department_name);
		}
	// console.log(deptName);
	});

	inquirer.prompt([
	{
		name: "input_prod",
		type: "input",
		message: "Enter Product name to add :",
		validate: function (data) {
			if (!data)
				return "Data cannot be empty..";
			else
				return true;
			}
	},
	{
		name: "input_dept",
		type: "list",
		message: "Choose Department for the product :",
		choices: deptName,
	},
	{
		name: "input_price",
		type: "input",
		message: "Enter Sale price of Item :",
		validate: function(value) {
			if (isNaN(value) === false) {
				return true;
			}
			return false;
		}
	  },
	  {
	  	name: "input_qty",
	  	type: "input",
	  	message: "Enter quantity to add : ",
	  	validate: function(value) {
	  		if (isNaN(value) === false) {
	  			return true;
	  		}
	  		return false;
	  	}
	  }
	])
	.then(function(answer) {
		connection.query("INSERT INTO products SET ?", 
		[
			{
				product_name:answer.input_prod,
				department_name:answer.input_dept,
				price: answer.input_price,
				stock_quantity: answer.input_qty,
				product_sales:0
			}
		],
		function(err, res){
			if (err) throw err;

		console.log(chalk.red.bold('New Product added ...'));
		displayOptions();
		});		
	})

}

