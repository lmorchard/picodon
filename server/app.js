const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");

module.exports = config => {
  const { app, SERVER_SECRET } = config;

  const session = cookieSession({
    name: "session",
    keys: [SERVER_SECRET],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  app.use(morgan("tiny"));
  app.use(cookieParser(SERVER_SECRET));
  app.use(session);
  app.use(
    bodyParser.json({
      type: ["application/json", "application/*+json"]
    })
  );
  app.use(
    bodyParser.text({
      type: "*/*"
    })
  );

  return { ...config, app };
};
