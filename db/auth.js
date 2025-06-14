const createError = require("http-errors");
const db = require("./db");
const bcrypt = require("bcrypt");
const { getUserByEmail } = require("./users");

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    // if user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      throw createError(409, "Email already in use");
    }

    await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashed]
    );

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.log("error");
    next(err);
  }
};

// const login = async (data) => {
//   const { email, password } = data;
//   try {
//     // Check if user exists
//     const existingUser = await getUserByEmail(email);
//     // console.log(existingUser);

//     // If no user found, reject
//     if (!existingUser) {
//       console.log("user does not exist");
//       throw createError(401, "Incorrect username or password");
//     }

//     const isPasswordMatch = await bcrypt.compare(
//       password,
//       existingUser.password
//     );

//     // Check for matching passwords
//     if (!isPasswordMatch) {
//       console.log("wrong password");
//       throw createError(401, "Incorrect username or password");
//     }

//     return existingUser;
//   } catch (err) {
//     throw createError(500, err);
//   }
// };

const getAuthUser = async (req, res, next) => {
  getUserByEmail;
};

module.exports = { register, getAuthUser };
