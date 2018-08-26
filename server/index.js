module.exports = config =>
  [
    "./db",
    "./app",
    "./routes/well-known",
    "./routes/api-v1",
    "./routes/actor",
    "./routes/root"
  ].reduce(
    (context, name) => require(name)(context) || context,
    config
  );
