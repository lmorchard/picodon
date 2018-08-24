const path = require("path");
const express = require("express");

module.exports = context => {
  const { app, USERNAME, SITE_DOMAIN, ACTOR_URL } = context;
  
  const rootRouter = express.Router();
  
  // https://www.w3.org/TR/activitypub/#inbox
  rootRouter.route("/inbox")
    .post((request, response) => {
      console.log("INBOX POST", request.body.toString("utf8"));
      response.status(202).json({});
    });

  rootRouter.route("/").get((request, response) => {
    response.sendFile(path.resolve(__dirname + "/../views/index.html"));
  });
  
  app.use("/", rootRouter);

  return { ...context };
};