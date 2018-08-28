const express = require("express");
const { asyncHandler } = require("../middleware");

module.exports = context => {
  const { app /* , USERNAME, SITE_DOMAIN, ACTOR_URL */ } = context;

  const rootRouter = express.Router();

  // https://www.w3.org/TR/activitypub/#inbox
  rootRouter.route("/inbox").post(
    asyncHandler(async (request, response) => {
      // eslint-disable-next-line no-console
      console.log("INBOX POST", {
        headers: request.headers,
        body: request.body
      });
      response.status(202).json({});
    })
  );

  app.use("/", rootRouter);

  return { ...context };
};
