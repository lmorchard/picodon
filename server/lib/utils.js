exports.fetchJson = (fetch, url) =>
  fetch(url, {
    headers: {
      Accept:
        'application/ld+json; profile="https://www.w3.org/ns/activitystreams", application/json'
    }
  }).then(r => r.json());

exports.requireAuthentication = (req, res, next) =>
  req.isAuthenticated() ? next() : res.status(403).send("Forbidden");

exports.asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.promiseMap = (items, fn) => Promise.all(items.map(fn));

exports.expandObject = async (fetch, object) => {
  if (typeof object.actor === "string") {
    object.actor = await exports.fetchJson(fetch, object.actor);
  }
  return object;
};

exports.expandObjects = async (fetch, objects) =>
  exports.promiseMap(objects, object => exports.expandObject(fetch, object));
