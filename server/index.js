module.exports = config =>
  ["app", "db", "auth", "sockets", "queues", "delivery"].reduce(
    (context, name) => require(`./${name}`)(context),
    {
      ...config,
      fetch: require("make-fetch-happen").defaults({
        cacheManager: "./.data/fetch-cache"
      })
    }
  );
