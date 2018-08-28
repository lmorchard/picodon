module.exports = config => {
  const { app } = [
    "./db",
    "./app",
    "./auth",
    "./routes"
  ].reduce((context, name) => require(name)(context), config);
  return app;
};