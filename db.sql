CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name varchar(100),
  email varchar(100),
  password varchar(100),
  github_id varchar(255) UNIQUE,
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name varchar(200),
  stock_available integer,
  description varchar(1000)
);

CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  product_id integer,
  user_id integer REFERENCES users(id)
);


CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  cart_id integer,
  user_id integer REFERENCES users(id),
  status varchar(50)
);

CREATE TABLE carts_products (
  cart_id integer REFERENCES carts(id),
  product_id integer REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (cart_id, product_id)
);

ALTER TABLE carts
ADD FOREIGN KEY (id, product_id)
REFERENCES carts_products(cart_id, product_id);

ALTER TABLE orders
ADD FOREIGN KEY (cart_id)
REFERENCES carts(id);

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  product_id integer REFERENCES products(id),
  cart_id integer REFERENCES carts(id)
);

ALTER TABLE cart_items
ADD CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id);

ALTER TABLE cart_items
ADD COLUMN amount integer;

ALTER TABLE orders
ADD COLUMN total integer;

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id integer REFERENCES orders(id),
  cart_id integer REFERENCES carts(id),
  quantity integer,
  product_id integer REFERENCES products(id)
);

ALTER TABLE order_items
ADD COLUMN item_total integer;

ALTER TABLE products
ADD COLUMN price integer;