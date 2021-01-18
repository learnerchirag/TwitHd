const express = require("express");
const passport = require("passport");
const Strategy = require("passport-twitter").Strategy;
const router = express.Router();
passport.use(
  new Strategy(
    {
      consumerKey: "JAABlOt9wzw9dyr8SASkPjRrj",
      consumerSecret: "ki0m1aFKtdYisdalDQUOHnfOS0EI5XC1Iez1xbhx0Htox2NwrI",
      callbackURL: "http://127.0.0.1:3000/login/auth/twitter/callback",
    },
    function (token, tokenSecret, profile, cb) {
      User.findOrCreate({ twitterId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
router.get("/", (req, res) => {
  console.log("authenticating");
  passport.authenticate("twitter");
});
router.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("successful");
    res.redirect("/");
  }
);

module.exports = router;
