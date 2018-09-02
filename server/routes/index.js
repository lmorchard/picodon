const express = require("express");
const { asyncHandler } = require("../lib/utils");

module.exports = context => {
  const { app } = context;

  const indexRouter = express.Router();

  // https://www.w3.org/TR/activitypub/#inbox
  indexRouter.route("/inbox").post(
    asyncHandler(async (request, response) => {
      // eslint-disable-next-line no-console
      console.log("INBOX POST", {
        headers: request.headers,
        body: request.body
      });
      response.status(202).json({});
    })
  );

  app.use("/", indexRouter);

  return ["well-known", "api-v1", "actor"].reduce(
    (context, name) => require(`./${name}`)(context),
    context
  );
};
