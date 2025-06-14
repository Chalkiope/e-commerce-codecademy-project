const express = require("express");
const passport = require("passport");
const { register, getAuthUser } = require("../db/auth");
const { getUserByEmail } = require("../db/users");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const FRONT_END_URL = process.env.FRONT_END_URL;

router.post("/register", register);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send("Invalid credentials");

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(200).send(user);
    });
  })(req, res, next);
});

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user"],
    failureRedirect: `${FRONT_END_URL}/login`,
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${FRONT_END_URL}/login`,
    successRedirect: `${FRONT_END_URL}/profile`,
  })
);

router.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "User logged out" });
  });
});

// router.get("/logout", (req, res, next) => {
//   req.logout((err) => {
//     if (err) {
//       console.error("Logout error:", err);
//       return res.status(500).json({ message: "Error logging out" });
//     }

//     // Destroy session after logout
//     req.session.destroy((err) => {
//       if (err) {
//         console.error("Session destroy error:", err);
//         return res.status(500).json({ message: "Error destroying session" });
//       }

//       // Clear the cookie from the browser
//       res.clearCookie("connect.sid", { path: "/" });
//       console.log("User logged out, session destroyed.");
//       return res.status(200).json({ message: "User logged out" });
//     });
//   });
// });

router.get("/profile", requireAuth, (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Send only safe data
  const { id, email, name } = req.user;
  return res.json({ id, email, name });
});

module.exports = router;
