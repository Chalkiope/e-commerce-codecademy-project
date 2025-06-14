const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY); // Use your Stripe secret key here
const { createOrder } = require("../db/orders"); // Path to your createOrder helper
const { getAuthUserCartId, getCartItems, clearCart } = require("../db/cart"); // Assuming these helpers exist

// IMPORTANT: Get your webhook secret from your Stripe Dashboard (Developers > Webhooks)
// It starts with 'whsec_'
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  console.log("enter webhook");
  // 1. Verify the webhook signature
  try {
    // stripe.webhooks.constructEvent expects the RAW body, not the parsed JSON body.
    // This is why we need special middleware order in index.js for this endpoint.
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    console.log("Webhook signature verified successfully.");
  } catch (err) {
    console.error(`⚠️  Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log(`✅ Checkout Session Completed: ${session.id}`);
      console.log(session);
      // At this point, the payment is successful.
      // You can retrieve metadata you passed during session creation (e.g., userId, cartId)
      const userId = session.metadata?.userId;
      const cartId = session.metadata?.cartId; // Assuming you pass cartId as metadata

      if (!userId || !cartId) {
        console.error(
          `Error: Missing userId or cartId in checkout session metadata for session ${session.id}`
        );
        // Consider sending an alert or logging this to a persistent error tracking system
        return res.status(400).send("Missing required metadata.");
      }

      try {
        // You already have cart_id and cartItems from your existing logic
        // We'll need to fetch them again here, as the webhook is a separate request.
        // It's safer to fetch them based on the userId/cartId received from Stripe.
        const userCartItems = await getCartItems(userId); // Use the userId from metadata

        if (!userCartItems || userCartItems.length === 0) {
          console.warn(
            `Webhook: Cart is empty for user ${userId} when trying to create order for session ${session.id}.`
          );
          // This might happen if cart was cleared between session creation and webhook,
          // or if initial session creation was for an empty cart (which should be prevented).
          // You might decide this is an error or just acknowledge.
          return res.status(200).json({
            received: true,
            message: "Cart was empty, no order created.",
          });
        }

        // Call your createOrder function here!
        const order = await createOrder(userId, cartId, userCartItems);

        if (order) {
          console.log(
            `Order ${order.id} created successfully for user ${userId} via webhook.`
          );
          // IMPORTANT: Clear the user's cart ONLY AFTER the order is successfully created
          await clearCart(cartId); // Assuming clearCart takes cart_id
          console.log(`Cart ${cartId} cleared for user ${userId}.`);
        } else {
          console.error(
            `Failed to create order for session ${session.id}. createOrder returned null.`
          );
          // Log this to a persistent system for manual review
        }
      } catch (orderError) {
        console.error(
          `Error processing order for session ${session.id}:`,
          orderError
        );
        // Implement robust error logging here (e.g., Sentry, New Relic)
        // You might also want to notify yourself or queue a retry for order creation
      }
      break;

    // Add other event types you want to handle, e.g.:
    // case 'payment_intent.payment_failed':
    //   const paymentIntent = event.data.object;
    //   console.log(`Payment Intent Failed: ${paymentIntent.id}`);
    //   // Update order status to 'Failed' if you have a 'pending' order
    //   break;
    // case 'customer.subscription.created':
    //   // Handle new subscriptions
    //   break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;
