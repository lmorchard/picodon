const { app, PORT, PROJECT_DOMAIN } = [
  "./db",
  "./app",
  "./routes/well-known",
  "./routes/api-v1",
  "./routes/actor",
  "./routes/root"
].reduce(
  (context, name) => require(name)(context) || context,
  require("./config")({ env: process.env })
);

const listener = app.listen(PORT, () => {
  console.log(
    "Your wonderful server app is listening on port",
    PROJECT_DOMAIN,
    listener.address().port
  );
});