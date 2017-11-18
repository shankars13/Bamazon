DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(8,2) NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (item_id)
);

CREATE TABLE department (
	department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(100) NULL,
    over_head_costs DECIMAL(10,2) NULL,
    PRIMARY KEY (department_id)
);

ALTER TABLE department AUTO_INCREMENT = 1001;


ALTER TABLE products 
ADD product_sales DECIMAL(10,2) NULL;

SELECT department_name, count(*) from products group by department_name;

select department.department_id , department.department_name, over_head_costs as C, SUM(product_sales) as D, (SUM(product_sales)-over_head_costs) as profit
from bamazon.department, bamazon.products 
where department.department_name = products.department_name
group by department_name;