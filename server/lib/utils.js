const fetch = require("node-fetch");

const asc = (a, b) => (a < b ? -1 : b < a ? 1 : 0);

const fetchJson = url =>
  fetch(url, {
    headers: {
      Accept:
        'application/ld+json; profile="https://www.w3.org/ns/activitystreams", application/json'
    }
  }).then(r => r.json());

module.exports = {
  asc,
  fetchJson
};
