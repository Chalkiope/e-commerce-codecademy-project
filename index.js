require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");

const pgSession = require("connect-pg-simple")(session); // ADDED: for persistent sessions
const db = require("./db/db");

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

const port = process.env.PORT || 3000;

initializePassport(passport);

app.set("trust proxy", true);
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
    // Use the pgSession store, connecting it to your existing PostgreSQL pool
    store: new pgSession({
      pool: db.pool, // Assumes your db.js exports a 'pool' property (see Step 4)
      tableName: "session", // Matches the table name you created in Step 2
    }),
    // Session secret: MUST be a strong, random string.
    // Use an environment variable for production, fallback to a dev secret.
    secret:
      process.env.SESSION_SECRET ||
      "a_very_strong_development_secret_that_is_long_and_random",
    resave: false, // Prevents saving session if not modified
    saveUninitialized: false, // Prevents creating sessions for unauthenticated users
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Session expiration time (1 day in milliseconds)
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      // 'secure' must be true in production when using HTTPS
      // process.env.NODE_ENV is typically 'production' on Render
      secure: process.env.NODE_ENV === "production",
      // 'SameSite' protects against CSRF. 'Lax' is often good, 'None' requires 'secure: true'
      // and explicit CSRF protection if your frontend and backend are on different domains.
      sameSite: "none",
    },
    name: "connect.sid", // Default name for the session cookie
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
