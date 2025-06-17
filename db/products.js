const db = require("./db");

const getProducts = (req, res, next) => {
  db.query("SELECT * FROM products ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

const getProductById = async (req, res, next) => {
  const id = parseInt(req.params.id);
  // console.log(`ID: ${req.params.id}`);
  db.query("SELECT * FROM products WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows[0]);
  });
};

const createProduct = (req, res, next) => {
  const { name, stock_available, description, price } = req.body;

  db.query(
    "INSERT INTO products (name, stock_available, description, price) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, stock_available, description, price],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).send(`Product added with ID: ${results.rows[0].id}`);
    }
  );
};

const updateProduct = (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name, stock_available, description, price } = req.body;

  db.query(
    "UPDATE products SET name = $1, stock_available = $2, description = $3, price = $4 WHERE id = $5",
    [name, stock_available, description, price, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).send(`Product modified with ID: ${id}`);
    }
  );
};

const deleteProduct = (request, response) => {
  const id = parseInt(request.params.id);

  db.query("DELETE FROM products WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Product deleted with ID: ${id}`);
  });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
