const db = require("./db");
const { stripe } = require("../index");

const getAuthUserCartId = async (user_id) => {
  try {
    const cart = await db.query("SELECT id FROM carts WHERE user_id = $1", [
      user_id,
    ]);
    if (cart.rows.length > 0) {
      const { id } = cart.rows[0];
      if (id) {
        return id;
      }
    } else {
      const newCart = await db.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
        [user_id]
      );
      if (newCart) {
        const { id } = newCart.rows[0];
        if (id) {
          return id;
        }
      }
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const addItem = async (user_id, item) => {
  try {
    const cart_id = await getAuthUserCartId(user_id);
    const { product_id, amount } = item;
    const existingItem = await db.query(
      "SELECT id FROM cart_items WHERE product_id = $1 AND cart_id = $2",
      [product_id, cart_id]
    );
    if (existingItem.rows?.length) {
      console.log("item exists");
      const updatedItem = await updateItem(user_id, item);
      return updatedItem;
    }
    if (cart_id) {
      const newCartItem = await db.query(
        "INSERT INTO cart_items (product_id, cart_id, amount) VALUES ($1, $2, $3) RETURNING *",
        [product_id, cart_id, amount]
      );
      if (newCartItem.rows?.length) {
        return newCartItem.rows[0];
      }
    }
    return null;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const updateItem = async (user_id, itemUpdate) => {
  try {
    const cart_id = await getAuthUserCartId(user_id);
    const { product_id, amount } = itemUpdate;
    console.log(`Product ID: ${product_id}`);
    console.log(`Amount: ${amount}`);
    console.log(`Cart id: ${cart_id}`);
    if (cart_id) {
      const update = await db.query(
        "UPDATE cart_items SET amount = $1 WHERE product_id = $2 AND cart_id = $3 RETURNING *",
        [amount, product_id, cart_id]
      );
      if (update.rows?.length) {
        console.log(`Update: ${update.rows[0]}`);
        return update.rows[0];
      }
    }
    return null;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const deleteItem = async (user_id, item) => {
  try {
    const cart_id = await getAuthUserCartId(user_id);
    console.log(cart_id);
    const { product_id } = item;
    console.log(product_id, cart_id);
    if (cart_id) {
      const itemToDelete = await db.query(
        "DELETE FROM cart_items WHERE product_id = $1 AND cart_id = $2",
        [product_id, cart_id]
      );
      console.log(itemToDelete);
      //   if (itemToDelete.rows?.length) {
      //     return itemToDelete.rows[0];
      //   }
    }
    return null;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getCartItems = async (user_id) => {
  try {
    const cart_id = await getAuthUserCartId(user_id);
    const items = await db.query(
      "SELECT * FROM cart_items JOIN products ON cart_items.product_id = products.id WHERE cart_id = $1",
      [cart_id]
    );
    if (items.rows?.length) {
      return items.rows;
    }
    return null;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getItemById = async (user_id, item_id) => {
  try {
    const cart_id = await getAuthUserCartId(user_id);
    const item = await db.query(
      //   "SELECT * FROM cart_items WHERE cart_id = $1 AND id = $2",
      "SELECT name, stock_available, description, amount FROM cart_items JOIN products ON cart_items.product_id = products.id WHERE cart_items.id = $2 AND cart_id = $1",
      [cart_id, item_id]
    );
    if (item.rows?.length) {
      return item.rows[0];
    }
    return null;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const clearCart = async (cart_id) => {
  try {
    const deleteAllItems = await db.query(
      "DELETE FROM cart_items WHERE cart_id = $1",
      [cart_id]
    );
    if (deleteAllItems.rows.length === 0) {
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const checkout = async (user_id) => {
  try {
    const cart_id = await getAuthUserCartId(user_id);
    // check if cart has items
    const cartItems = await getCartItems(user_id);
    // create order with cart items
    const order = await createOrder(user_id, cart_id, cartItems);
    if (order) {
      const emptyCart = await clearCart(cart_id);
    }
    return order;
  } catch (error) {
    throw new Error(error);
  }
};

const stripeCheckout = async (user_id) => {
  try {
    // console.log(stripe);
    const cart_id = await getAuthUserCartId(user_id);
    const cartItems = await getCartItems(user_id);
    console.log(`Cart items retrieved:`);
    console.log(cartItems);

    if (!cartItems || cartItems.length === 0) {
      console.log("stripeCheckout: Cart is empty. Returning null.");
      return null; // Explicitly return null to indicate an empty cart state
    }

    // map cart items to stripe line items
    const line_items_for_stripe = cartItems.map((item) => {
      // Ensure your item objects have 'name', 'price', and 'amount' (quantity) properties
      // Adjust property names (e.g., item.product_name, item.unit_price) to match your DB schema
      if (
        !item.name ||
        typeof item.price === "undefined" ||
        typeof item.amount === "undefined"
      ) {
        console.warn(
          "stripeCheckout: Cart item missing required properties:",
          item
        );
        // You might want to throw an error here, or skip this item.
        // For now, let's make it robust by ensuring valid data for Stripe.
        throw new Error(
          `Invalid item in cart: ${JSON.stringify(
            item
          )}. Missing name, price, or amount.`
        );
      }

      // Stripe's unit_amount is in cents (smallest currency unit)
      const unitAmountInCents = Math.round(item.price * 100);

      return {
        price_data: {
          currency: "nzd", // Ensure this matches your Stripe currency
          product_data: {
            name: item.name,
          },
          unit_amount: unitAmountInCents,
        },
        quantity: item.amount, // 'amount' from your cart_items is 'quantity' for Stripe
      };
    });

    // Check if any valid line items were generated
    if (line_items_for_stripe.length === 0) {
      console.log(
        "stripeCheckout: No valid line items could be generated. Returning null."
      );
      return null; // Or throw a more specific error
    }
    // create stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items_for_stripe,
      mode: "payment",
      // The URL of your payment completion page
      success_url: `${process.env.FRONT_END_URL}/thank_you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_END_URL}/cart`, // IMPORTANT: Your frontend cart/cancel URL
      metadata: {
        userId: user_id.toString(), // Convert to string if it's a number/UUID
        cartId: cart_id.toString(), // Convert to string if it's a number/UUID
      },
    });
    console.log("After session create");
    // console.log(session.client_secret);

    // // create order
    // // to do: split this up and do after checkout success
    // const order = await createOrder(user_id, cart_id, cartItems);
    // console.log(`Order created:`);
    // console.log(order);
    // if (order) {
    //   const emptyCart = await clearCart(cart_id);
    // }
    return { sessionUrl: session.url };
    // return { checkoutSessionClientSecret: session.client_secret };
  } catch (error) {
    console.error("Error in stripeCheckout helper function:");
    console.error("Caught error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error.raw) {
      console.error("Stripe Raw Error:", JSON.stringify(error.raw, null, 2));
    }
    if (error.statusCode) {
      console.error("Error Status Code:", error.statusCode);
    }
    throw error; // Re-throw the error for the route handler to catch and pass to next(error)
  }
};

module.exports = {
  addItem,
  deleteItem,
  updateItem,
  getCartItems,
  getItemById,
  checkout,
  clearCart,
  stripeCheckout,
  getAuthUserCartId,
};
