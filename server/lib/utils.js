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

exports.coerceArray = thing => {
  if (!thing) { return []; }
  return Array.isArray(thing) ? thing : [ thing ];
}

exports.dereferenceId = async (fetch, id) => {
  if (typeof(id) !== "string") {
    return id;
  }
  return exports.fetchJson(fetch, id);  
};

exports.expandObjects = async (fetch, objects, toDereference = ["actor"]) => {
  // 1. Gather IDs to dereference, forming unique set
  const ids = {};
  objects.forEach(object => {
    toDereference.forEach(name => {
      if (typeof object[name] === "string") {
        ids[object[name]] = true;
      }
    });
  });

  // 2. Dereference the unique set of IDs
  const fetches = await exports.promiseMap(Object.keys(ids), id =>
    exports.fetchJson(fetch, id).then(data => [id, data])
  );

  // 3. Index the fetched objects by ID
  const byId = fetches.reduce(
    (acc, [id, data]) => ({ ...acc, [id]: data }),
    {}
  );

  // 4. Replace the IDs with data in the objects
  return objects.map(object => {
    const output = { ...object };
    toDereference.forEach(name => {
      if (typeof output[name] === "string") {
        output[name] = byId[output[name]];
      }
    });
    return output;
  });
};
