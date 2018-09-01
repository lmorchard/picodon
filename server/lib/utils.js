const fetch = require("node-fetch");

exports.fetchJson = url =>
  fetch(url, {
    headers: {
      Accept:
        'application/ld+json; profile="https://www.w3.org/ns/activitystreams", application/json'
    }
  }).then(r => r.json());

exports.requireAuthentication = (req, res, next) =>
  req.isAuthenticated() ? next() : res.status(403).send("Forbidden");
