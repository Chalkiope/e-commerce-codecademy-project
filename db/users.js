const db = require("./db");
const bcrypt = require("bcrypt");

const getUsers = (req, res, next) => {
  db.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

const getUserById = (req, res, next) => {
  const id = parseInt(req.params.id);

  db.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

const getUserByEmail = async (email) => {
  // const { email } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows?.length) {
      return result.rows[0];
    }
    return null;
  } catch (error) {
    throw new Error(error);
  }
};

const getUserByGitHubId = async (githubId) => {
  const res = await db.query("SELECT * FROM users WHERE github_id = $1", [
    githubId,
  ]);
  return res.rows[0];
};

const createUser = async ({ name, email, password, githubId }) => {
  // to do: reuse in local register function
  // const { name, email, password, githubId } = req.body;

  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  let query, values;
  if (githubId && email) {
    // For GitHub with email
    query =
      "INSERT INTO users (github_id, name, email) VALUES ($1, $2, $3) RETURNING *";
    values = [githubId, name, email];
  } else if (githubId) {
    // For GitHub without a primary email (less common but possible)
    query = "INSERT INTO users (github_id, name) VALUES ($1, $2) RETURNING *";
    values = [githubId, name];
  } else if (email && hashedPassword) {
    // For local registration
    query =
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *";
    values = [name, email, hashedPassword];
  } else {
    throw new Error(
      "Invalid parameters for creating user. Missing email/password or githubId."
    );
  }

  const res = await db.query(query, values);
  return res.rows[0];
  // db.query(
  //   "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
  //   [name, email, password],
  //   (error, results) => {
  //     if (error) {
  //       throw error;
  //     }
  //     res.status(201).send(`User added with ID: ${results.rows[0].id}`);
  //   }
  // );
};

const updateUser = (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;

  db.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  db.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

module.exports = {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  getUserByGitHubId,
  updateUser,
  deleteUser,
};
