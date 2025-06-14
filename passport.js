const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcrypt");
const db = require("./db/db");
const { createUser, getUserByGitHubId } = require("./db/users");

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

function initialize(passport) {
  // Local login
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const res = await db.query("SELECT * FROM users WHERE email = $1", [
            email,
          ]);
          const user = res.rows[0];
          if (!user) return done(null, false, { message: "No user found" });

          const match = await bcrypt.compare(password, user.password);
          if (!match)
            return done(null, false, { message: "Incorrect password" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  // Github login
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 1. Check if user exists by GitHub ID
          let user = await getUserByGitHubId(profile.id);

          if (user) {
            // User exists, log them in
            return done(null, user);
          } else {
            // User does NOT exist, create a new one
            const email =
              profile.emails && profile.emails.length > 0
                ? profile.emails.find((e) => e.verified)?.value ||
                  profile.emails[0].value
                : null;
            const name = profile.displayName || profile.username;
            console.log(profile);
            // Use the reusable createUser function
            const newUser = await createUser({
              githubId: profile.id,
              name: email,
              email: email, // Email might be null if not provided by GitHub
            });

            return done(null, newUser);
          }
        } catch (err) {
          console.error("Error during GitHub authentication callback:", err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    const res = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, res.rows[0]);
  });
}

module.exports = initialize;
