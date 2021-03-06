//* drop the database if it already exists */
DROP DATABASE IF EXISTS bamazon;

/* Create the database */
CREATE DATABASE bamazon;

/* Use the database */
USE bamazon;

/* Create a new products table with the required columns */
CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(45) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    product_sales DECIMAL(10,2) NOT NULL DEFAULT 0.00, 
    PRIMARY KEY (item_id)
);

/* Create a new departments table with the required columns */
CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(45) NOT NULL,
    overhead_costs DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (department_id)
);