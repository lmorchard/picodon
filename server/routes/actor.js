const express = require("express");
const { LocalActor } = require("../lib/stamps");

module.exports = context => {
  const { app, USERNAME, SITE_DOMAIN, ACTOR_PATH, ACTOR_URL, ACTOR_KEY_URL, PUBLIC_KEY, PRIVATE_KEY } = context;
  
  const actorRouter = express.Router();

  actorRouter.route("/")
    .get((request, response) => {
      response.json(LocalActor({ USERNAME, ACTOR_URL, ACTOR_KEY_URL, PUBLIC_KEY }));
    });

  // https://www.w3.org/TR/activitypub/#outbox
  actorRouter.route("/outbox")
    .get((request, response) => {
      response.json({ "FOO": "FOOO12" });
    })
    .post((request, response) => {
    });

  // https://www.w3.org/TR/activitypub/#inbox
  actorRouter.route("/inbox")
    .post((request, response) => {
      console.log("ACTOR INBOX POST", request.body.toString("utf8"));
      response.status(202).json({});
    });

  actorRouter.route("/following")
    .get((request, response) => {
    });

  actorRouter.route("/followers")
    .get((request, response) => {
    });

  actorRouter.route("/liked")
    .get((request, response) => {
    });

  app.use(ACTOR_PATH, actorRouter);

  return { ...context };
};