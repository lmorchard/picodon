const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

module.exports = config => {
  const { app, USERNAME, PASSWORD } = config;

  const userById = id => (id !== USERNAME)
      ? null
      : ({ id: USERNAME, displayName: USERNAME });

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => done(null, userById(id)));

  passport.use(new LocalStrategy(
    (username, password, done) => {
      if (username !== USERNAME)
        return done(null, false, { message: "Incorrect username." });
      if (password !== PASSWORD)
        return done(null, false, { message: "Incorrect password." });
      return done(null, userById(USERNAME));
    }
  ));

  const authRouter = express.Router();

  authRouter.route("/")
    .get((req, res) => res.json(
      req.isAuthenticated() 
        ? { user: req.user }
        : false
    ));

  authRouter.route("/login")
    .post(
      passport.authenticate("local"),
      (req, res) => res.json({ user: req.user })
    );

  authRouter.route("/logout")
    .post((req, res) => {
      req.logout();
      res.json({ success: true });
    });
  
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/auth", authRouter);
    
  return { ...config };
};
