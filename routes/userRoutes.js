const express = require("express");
const userRouter = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../db/users");
const cartRouter = require("./productRoutes");

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/", createUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

// Cart
// userRouter.use("/:id/cart/items", cartRouter);
// userRouter.get("/:id/cart/items/:product_id", getCart);
// userRouter.post("/:id/cart/items", addToCart);
// userRouter.delete("/:id/cart/items/:product_id", removeFromCart);
// userRouter.put("/:id/cart/items/:product_id", updateItemInCart);

// TODO Orders
// userRouter.get("/:id/orders", getOrders);
// userRouter.get("/:id/orders/:order_id/items", getOrderById);
// userRouter.post("/:id/orders", getOrderById);

module.exports = userRouter;
