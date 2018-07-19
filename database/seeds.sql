/* Use the bamazon database */
USE bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES  ("watermelon", "produce", 2.99, 50),
        ("strawberries", "produce", 4.99, 50),
        ("bananas", "produce", 0.59, 300),
        ("honeydew melons", "produce", 3.99, 30),
        ("cantalope", "produce", 2.99, 40),
        ("raspberries", "produce", 2.99, 50),
        ("blackberries", "produce", 2.99, 20),
        ("blueberries", "produce", 2.50, 50),
        ("bread", "bakery", 3.59, 100),
        ("rolls", "bakery", 0.99, 50),
        ("bear naked granola", "gm", 5.99, 25),
        ("cheerios", "gm", 3.99, 40);
        