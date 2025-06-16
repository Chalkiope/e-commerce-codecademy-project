const express = require("express");
const orderRouter = express.Router();

const {
  getOrders,
  getOrderById,
  getOrdersWithItems,
  createOrder,
} = require("../db/orders");

const { getCartItems } = require("../db/cart");

orderRouter.get("/", async (req, res, next) => {
  try {
    const user = req.user.id;
    const response = await getOrdersWithItems(user);
    console.log(`Response: ${response}`);
    if (response === null) {
      return res
        .status(200)
        .json({ message: "No orders placed yet", orders: [] });
    }
    return res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/:id", async (req, res, next) => {
  try {
    // const user = req.user.id;
    const response = await getOrderById(req.params.id);
    console.log(`Response: ${response}`);
    if (response === null) {
      return res.status(200).send("No orders placed yet");
    }
    return res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

orderRouter.post("/", async (req, res, next) => {
  try {
    const cartItems = await getCartItems(req.user.id);
    console.log(cartItems);
    const cart_id = cartItems[0].cart_id;
    const response = await createOrder(req.user.id, cart_id, cartItems);
    console.log(response);
    if (response === null) {
      return res.status(400).json({ message: "Order could not be created" });
    }
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = orderRouter;
