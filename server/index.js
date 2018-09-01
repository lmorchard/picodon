// Cache the server setup until the module is reloaded.
let app = null;
module.exports = config => {
  if (!app) {
    ({ app } = ["db", "app", "auth", "routes"].reduce(
      (context, name) => require(`./${name}`)(context),
      config
    ));
  }
  return app;
};
