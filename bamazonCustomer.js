var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table2');


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "0710",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id: " + connection.threadId);
    initialAction();
})

function initialAction() {
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function(err, res) {
        if (err) throw err;
        else {
            // Creating formatted Table
            var table = new Table({
                head: ['ID', 'Item', 'Price', 'Quantity']
             , style: {
                 head: []
               , border: []  
             }
             , colWidths: [6, 21, 15, 15]
           });
           // Filling the table with products from database
            for(var i = 0; i < res.length; i++) {
                table.push(
                    [res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]
                );
            }
            // Showing customer the products
            console.log(table.toString());

            // Inquirer
            inquirer.prompt([
                // which product ID do they want to purchase
                {
                    name: "choice",
                    type: "input",
                    message: "Please enter the ID of the product you wish to purchase.",
                    validate: function(value) {
                        if(isNaN(value)==false){
                            return true;
                        } else {
                            return false;
                        }
                    }
                },
                // how many of the product do they want to purchase
                {
                    name: "quantity",
                    type: "input",
                    message: "Please enter the quantity you wish to purchase.",
                    validate: function(value) {
                        if(isNaN(value)==false){
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            ])
            .then(function(answer) {
                // loop through products, check if answer.choice === product ID, if it is then check if answer.quantity is less than product quantity, if it is then log successful purchase.
                for(var j = 0; j < res.length; j++) {
                    // using == instead of === because that's what's workin lol
                    if (answer.choice == res[j].item_id) {
                        if (answer.quantity < res[j].stock_quantity) {
                            // update the quantity where the product id = item_id. Set the quantity = stock_quantity - answer.quantity.
                            connection.query("UPDATE products SET stock_quantity = " + (res[j].stock_quantity - answer.quantity) + " WHERE item_id = " + answer.choice);
                            console.log("You have successfully purchased " + answer.quantity + " " + res[j].product_name + " for $" + res[j].price);
                        } else {
                            console.log("Sorry, we only have " + res[j].stock_quantity + " " + res[j].product_name + " in stock.");
                        }
                    }
                }
            })
        };
    });
    
}
