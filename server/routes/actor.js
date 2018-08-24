const express = require("express");

module.exports = context => {
  const { app, USERNAME, SITE_DOMAIN, ACTOR_PATH, ACTOR_URL, ACTOR_KEY_URL, PUBLIC_KEY, PRIVATE_KEY } = context;
  
  const actorRouter = express.Router();

  actorRouter.route("/")
    .get((request, response) => {
      // https://www.w3.org/TR/activitypub/#actor-objects
      response.json({
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          "https://w3id.org/security/v1"
        ],
        "id": ACTOR_URL,
        "type": "Person",
        // "name": USERNAME,
        // "summary": "summary goes here",
        // "icon": [
        //   "https://kenzoishii.example.com/image/165987aklre4"
        // ],
        "preferredUsername": USERNAME,
        "inbox": `${ACTOR_URL}/inbox`,
        "outbox": `${ACTOR_URL}/outbox`,
        "following": `${ACTOR_URL}/following`,
        "followers": `${ACTOR_URL}/followers`,
        "liked": `${ACTOR_URL}/liked`,
        "publicKey": {
          "id": ACTOR_KEY_URL,
          "owner": ACTOR_URL,
          "publicKeyPem": PUBLIC_KEY
        }
      });
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