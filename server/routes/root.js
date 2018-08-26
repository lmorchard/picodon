const path = require("path");
const express = require("express");
const { asyncHandler } = require("../middleware");

module.exports = context => {
  const { app, USERNAME, SITE_DOMAIN, ACTOR_URL } = context;

  const rootRouter = express.Router();

  // https://www.w3.org/TR/activitypub/#inbox
  rootRouter.route("/inbox").post(
    asyncHandler(async (request, response) => {
      const { method, originalUrl: path, headers } = request;
      console.log("INBOX POST", { headers, body: request.body });
      response.status(202).json({});
    })
  );

  rootRouter.route("/").get((request, response) => {
    response.sendFile(path.resolve(__dirname + "/../views/index.html"));
  });

  app.use("/", rootRouter);

  return { ...context };
};
