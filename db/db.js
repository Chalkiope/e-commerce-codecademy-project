const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const query = (text, params, callback) => {
  return pool.query(text, params, callback);
};

module.exports = {
  query, // Export your query helper
  pool, // ADDED: Export the pool instance itself for session store
};
