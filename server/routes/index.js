module.exports = config =>
  ["./well-known", "./api-v1", "./actor", "./root"].reduce(
    (context, name) => require(name)(context),
    config
  );
