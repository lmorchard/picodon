const express = require("express");

module.exports = context => {
  const { app, USERNAME, SITE_DOMAIN, ACTOR_URL } = context;

  const wellKnownRouter = express.Router();

  wellKnownRouter.route("/webfinger").get((request, response) => {
    const { resource } = request.query;
    if (resource === `acct:${USERNAME}@${SITE_DOMAIN}`) {
      return response.json({
        subject: `acct:${USERNAME}@${SITE_DOMAIN}`,
        links: [
          {
            rel: "self",
            type: "application/activity+json",
            href: ACTOR_URL
          }
        ]
      });
    }
    response.status(404).send("NOT FOUND");
  });

  app.use("/.well-known", wellKnownRouter);

  return { ...context };
};
