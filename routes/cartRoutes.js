const express = require("express");
const cartRouter = express.Router({ mergeParams: true });

const {
  getCartItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  checkout,
  stripeCheckout,
} = require("../db/cart");

cartRouter.get("/", async (req, res, next) => {
  try {
    const user = req.user.id;
    const cartItems = await getCartItems(user);

    console.log(`Response: ${cartItems}`);
    if (!cartItems || cartItems.length === 0) {
      // If the cart is empty or getCartItems returned null/undefined
      return res.status(200).json({
        // Use .json() to ensure Content-Type is application/json
        message: "Your cart is empty.",
        cart: [], // Explicitly send an empty array for cart items
      });
    }
    return res.status(200).json({
      // Use .json()
      message: "Welcome to your cart!",
      cart: cartItems, // Send the actual cart items array
    });
  } catch (error) {
    next(error);
  }
});
cartRouter.post("/", async (req, res, next) => {
  try {
    const user = req.user.id;
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send("Request body is missing");
    }
    const item = req.body;
    const response = await addItem(user, item);
    console.log(`Response: ${response}`);
    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
});
cartRouter.delete("/", async (req, res, next) => {
  try {
    const user = req.user.id;
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send("Request body is missing");
    }
    const item = req.body;
    console.log(user, item);
    const response = await deleteItem(user, item);
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});
cartRouter.put("/", async (req, res, next) => {
  try {
    const user = req.user.id;
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send("Request body is missing");
    }
    const itemUpdate = req.body;
    console.log(user, itemUpdate);
    const response = await updateItem(user, itemUpdate);
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});
cartRouter.get("/:item_id", async (req, res, next) => {
  try {
    const user = req.user.id;
    const response = await getItemById(user, req.params.item_id);
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

cartRouter.post("/checkout", async (req, res, next) => {
  try {
    const user = req.user.id;
    console.log("this works");
    const orderResponse = await checkout(user);
    console.log(`Response: ${await orderResponse}`);
    if (orderResponse === null) {
      return res.status(200).send("The cart is empty, order did not work");
    }
    return res.status(200).send(orderResponse);
  } catch (error) {
    next(error);
  }
});

cartRouter.post("/stripe-checkout", async (req, res, next) => {
  try {
    const user = req.user.id;
    console.log("this works");
    // only set up stripe for payment (get secret key)
    const stripeCheckoutResponse = await stripeCheckout(user);
    console.log(
      `Response from stripeCheckout: ${await stripeCheckoutResponse}`
    );
    if (stripeCheckoutResponse === null) {
      return res
        .status(400)
        .json({ message: "The cart is empty, order did not work" });
    }
    return res.status(200).json(stripeCheckoutResponse);
  } catch (error) {
    // This catch block will now properly receive errors thrown by stripeCheckout
    console.error(
      "cartRouter: Caught error in /stripe-checkout route handler:"
    );
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    // Also check for specific status code on the error object here
    console.error("Error status property:", error.status); // Log what this value is

    // Pass the error to the Express global error handling middleware
    // This middleware is usually where the "Invalid status code" error is triggered
    // if `err.status` is undefined or invalid.
    next(error);
  }
});

module.exports = cartRouter;
