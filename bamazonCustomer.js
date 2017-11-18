//Required npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var chalk = require('chalk');

//Define Table for output display using cli-table
var table = new Table({
    head: ['ITEM ID', 'PRODUCT NAME', 'PRICE']
});

//mysql database and sql server 
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "Mysqpass!1",
	database: "bamazon"
});

//make connection to sql server and database. call function to display products
connection.connect(function(err) {
	if (err) throw err;
	
	console.log();
	console.log(chalk.yellow('	B A M A Z O N   C U S T O M E R '));
	console.log();
	displayProducts();
});


//display products available for the customer to purchase
function displayProducts() {
	var query = "SELECT item_id, product_name, price FROM products WHERE stock_quantity > 0"
	connection.query(query, function(err, res){
		if (err) throw err;

		for (var i = 0; i<res.length; i++) {
			table.push( [res[i].item_id, res[i].product_name, res[i].price]);
		}

		console.log();
		console.log(chalk.blue('     BAMAZON PRODUCT CATALOG'));
		console.log(chalk.blue('     ~~~~~~~~~~~~~~~~~~~~~~~'));
		console.log(table.toString());
		// connection.end();
	getUserInput();
	});
}

//User input of product to order and quantity
function getUserInput() {
	inquirer.prompt([
	{
		name: "input_id",
		type: "input",
		message: "Enter ITEM ID# to order :",
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
	  	message: "Enter quantity to order : ",
	  	validate: function(value) {
	  		if (isNaN(value) === false) {
	  			return true;
	  		}
	  		return false;
	  	}
	  }
	])
	.then(function(answer) {

		if (!answer.input_qty )
			answer.input_qty = 0;
		var query = "SELECT item_id, stock_quantity,price,product_sales FROM products WHERE ?"
		connection.query(query, {item_id:answer.input_id},function(err,res){
		if (err) throw err;

		if (!res.length) {
			console.log()
			console.log(chalk.white('	Product not available to order'))
		}
		else { 
			if (parseInt(answer.input_qty) <= res[0].stock_quantity) {
				// console.log('Order can be placed');
				var new_qty = res[0].stock_quantity - parseInt(answer.input_qty);
				updateStockQuantity(answer.input_id,new_qty);
				var new_sales = res[0].product_sales + (answer.input_qty * res[0].price)
				updateProductSales(answer.input_id,new_sales);
				console.log('	Your order is Confirmed ');
				console.log(chalk.red.bold('	Total price : $' + parseInt(answer.input_qty)*res[0].price));
			}
				else {
					// console.log('input qty : ' + answer.input_qty);
				console.log(chalk.red.bold("Insufficient Quantity in stock.."));
			}
		}
		console.log();
		console.log(chalk.bgBlue('	Thank you for Shopping at Bamazon'));
		console.log(chalk.blue('	.................................'));
		connection.end();
		})
	})

}

//Update product sales for the products purchased by the customer
function updateProductSales(prod_id,prod_sales) {

	// console.log('inside update : ' + prod_sales);
	connection.query("UPDATE products SET ? WHERE ?", 
		[
			{
				product_sales: prod_sales
			},
			{
				item_id: prod_id
			}
		],
		function(err, res){
			if (err) throw err;
	}); 
}

//Update the stock quantity for the products purchased by the customer
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