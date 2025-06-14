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
  const { name, stock_available, description } = req.body;

  db.query(
    "INSERT INTO products (name, stock_available, description) VALUES ($1, $2, $3) RETURNING *",
    [name, stock_available, description],
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
  const { name, stock_available, description } = req.body;

  db.query(
    "UPDATE products SET name = $1, stock_available = $2, description = $3 WHERE id = $4",
    [name, stock_available, description, id],
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
