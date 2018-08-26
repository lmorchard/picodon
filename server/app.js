const morgan = require("morgan");
const bodyParser = require("body-parser");

module.exports = config => {
  const { app } = config;

  app.use(morgan("tiny"));
  app.use(bodyParser.json({ type: [
    "application/json",
    "application/*+json"
  ]}));
  app.use(bodyParser.text({ type: "*/*" }));

  return { ...config };
};
