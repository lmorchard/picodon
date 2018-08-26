const fetch = require("node-fetch");

// eslint-disable-next-line no-nested-ternary
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
