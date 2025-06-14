const db = require("./db");
const getAuthUserCartId = require("./cart");

const getOrders = async (user) => {
  try {
    const orders = await db.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC",
      [user]
    );
    if (orders.rows?.length) {
      return orders.rows;
    }
    return null;
  } catch (error) {
    throw new Error(error);
  }
};

const getOrdersWithItems = async (user) => {
  try {
    const order_items = await db.query(
      "SELECT orders.id, orders.user_id, orders.status, orders.total, JSON_AGG(JSON_BUILD_OBJECT('order_item_id', order_items.id, 'product_id', products.id, 'product_name', products.name, 'product_description', products.description, 'product_price', products.price, 'quantity_ordered', order_items.quantity) ORDER BY order_items.id) AS items FROM orders JOIN order_items ON orders.id = order_items.order_id JOIN products ON products.id = order_items.product_id WHERE orders.user_id = $1 GROUP BY orders.id, orders.user_id, orders.total ORDER BY orders.id DESC",
      [user]
    );
    if (order_items.rows?.length) {
      console.log("yay");
      return order_items.rows;
    }
    return null;
  } catch (error) {
    throw new Error(error);
  }
};

const getOrderById = async (order_id) => {
  try {
    const order = await db.query("SELECT * FROM orders WHERE id = $1", [
      order_id,
    ]);
    if (order.rows?.length) {
      return order.rows[0];
    }
    return null;
  } catch (error) {
    throw new Error(error);
  }
};

const createOrder = async (user_id, cart_id, items) => {
  try {
    console.log("entered create order");
    const order = await db.query(
      "INSERT INTO orders (cart_id, user_id, status) VALUES ($1, $2, $3) RETURNING *",
      [cart_id, user_id, "In progress"]
    );
    console.log(order.rows);
    const { id } = order.rows[0];
    let total = 0;
    const addOrderItems = await Promise.all(
      items.map(async (item) => {
        const { product_id, amount } = item;
        const priceQuery = await db.query(
          "SELECT price FROM products WHERE id = $1",
          [product_id]
        );
        // get price from products table
        const { price } = priceQuery.rows[0];
        // calculate total
        let item_total = 0;
        item_total = amount * price;
        total += item_total;
        console.log(id, cart_id, amount, product_id, item_total, total);
        // create order item
        return db.query(
          "INSERT INTO order_items (order_id, cart_id, quantity, product_id, item_total) VALUES ($1, $2, $3, $4, $5)",
          [id, cart_id, amount, product_id, item_total]
        );
      })
    );
    console.log("update order", total);
    // create order with total
    const updatedOrder = await db.query(
      "UPDATE orders SET total = $1 WHERE id = $2 RETURNING *",
      [total, id]
    );
    if (updatedOrder.rows?.length) {
      return updatedOrder.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error in createOrder helper:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Order creation failed: ${error}`);
    }
  }
};

module.exports = { getOrders, getOrdersWithItems, getOrderById, createOrder };
