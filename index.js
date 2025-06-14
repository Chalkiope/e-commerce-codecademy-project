require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");

const stripe = require("stripe")(`${process.env.STRIPE_KEY}`, {
  apiVersion: "2025-03-31.basil",
});
module.exports.stripe = stripe;
const requireAuth = require("./middleware/auth");

const initializePassport = require("./passport");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const cartRouter = require("./routes/cartRoutes");
const orderRouter = require("./routes/orderRoutes");
const webhookRouter = require("./routes/webhookRoutes");

const port = 3000;

initializePassport(passport);

app.use(
  cors({
    origin: process.env.FRONT_END_URL, // your frontend URL
    credentials: true, // allow cookies/session headers
  })
);

// IMPORTANT: This middleware needs to come BEFORE bodyParser.json()
// It captures the raw body needed by Stripe's webhook signature verification.
// Apply it ONLY to your webhook endpoint.
app.use(
  "/api/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    // We manually attach the raw body to req.rawBody for the webhook handler
    // This is a common pattern when using rawBody for signature verification.
    req.rawBody = req.body;
    next();
  }
);
app.use("/api/stripe-webhook", webhookRouter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "my_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/cart", requireAuth, cartRouter);
app.use("/orders", requireAuth, orderRouter);

// Error Handler
// Global Error Handler - make it more robust
app.use((err, req, res, next) => {
  // Check if headers have already been sent to prevent "Cannot set headers after they are sent" error
  if (res.headersSent) {
    return next(err); // Pass to default Express error handler or next middleware
  }
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.status || err.statusCode || 500; // Prefer err.status, then err.statusCode, else 500
  const message = err.message || "An unexpected server error occurred";

  // Only send detailed error info in development
  res.status(statusCode).json({
    message: message,
    error: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

app.listen(port, () => {
  console.log(`Server running`);
});
