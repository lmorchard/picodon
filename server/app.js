const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");

module.exports = config => {
  const app = express();
  
  app.use(morgan("tiny"));
  app.use(express.static("public"));
  app.use(bodyParser.json());
  // app.use(bodyParser.raw({ type: "*/*" }));
  app.use(bodyParser.text({ type: "*/*" }));

  return { ...config, app };
}