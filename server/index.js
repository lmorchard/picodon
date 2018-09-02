// Cache the server setup until the module is reloaded.
let app = null;
module.exports = config => (app ? app : (app = buildApp(config)));

const buildApp = config => {
  // TODO: optimize this to handle local fetches without http request
  const fetch = require("make-fetch-happen").defaults({
    cacheManager: "./.data/fetch-cache"
  });

  const context = ["app", "db", "auth", "queues", "routes", "delivery"].reduce(
    (context, name) => require(`./${name}`)(context),
    {
      ...config,
      fetch
    }
  );

  return context.app;
};
