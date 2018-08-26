module.exports = config =>
  [
    "./db",
    "./app",
    "./auth",
    "./routes"
  ].reduce((context, name) => require(name)(context), config);
