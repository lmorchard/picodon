const express = require("express");
const { LocalActor } = require("../lib/stamps");
const { verifyRequest, getPublicKey } = require("../lib/crypto");
const { asyncHandler } = require("../middleware");

module.exports = context => {
  const {
    app,
    USERNAME,
    SITE_DOMAIN,
    ACTOR_PATH,
    ACTOR_URL,
    ACTOR_KEY_URL,
    PUBLIC_KEY,
    PRIVATE_KEY
  } = context;

  const actorRouter = express.Router();

  actorRouter.route("/").get((request, response) => {
    response.json(
      LocalActor({ USERNAME, ACTOR_URL, ACTOR_KEY_URL, PUBLIC_KEY })
    );
  });

  // https://www.w3.org/TR/activitypub/#outbox
  actorRouter
    .route("/outbox")
    .get((request, response) => {
      response.json({ FOO: "FOOO12" });
    })
    .post((request, response) => {});

  // https://www.w3.org/TR/activitypub/#inbox
  actorRouter.route("/inbox").post(
    asyncHandler(async (request, response) => {
      const { method, originalUrl: path, headers, body } = request;
      const requestVerified = await verifyRequest({ method, path, headers });
      if (!requestVerified) {
        // TODO: log these messages for later review? lots of Deleted actions for users
        return response.status(401).send("HTTP signature not verified");
      }
      console.log("ACTOR INBOX POST", { headers, body });
      response.status(202).json({});
    })
  );

  actorRouter.route("/following").get((request, response) => {});

  actorRouter.route("/followers").get((request, response) => {});

  actorRouter.route("/liked").get((request, response) => {});

  app.use(ACTOR_PATH, actorRouter);

  return { ...context };
};
