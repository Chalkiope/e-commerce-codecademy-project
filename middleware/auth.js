const requireAuth = (req, res, next) => {
  console.log(
    "---------------------------------------------------------------"
  );
  // console.log("Session:", req.session);
  // console.log("Passport:", req.session?.passport);
  // console.log("User:", req.user);
  console.log(
    "Is Authenticated:",
    req.isAuthenticated && req.isAuthenticated()
  );
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next(); // User is authenticated
  }

  console.log("meh");
  res.status(401).json({ message: "Unauthorized" });
};

module.exports = requireAuth;
