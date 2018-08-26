const fetch = require("node-fetch");
const url = require("url");

const { signRequest, verifyRequest } = require("../server/lib/crypto");

const {
  USERNAME,
  PROJECT_DOMAIN,
  PUBLIC_KEY,
  PRIVATE_KEY,
  SITE_DOMAIN,
  SITE_URL,
  ACTOR_PATH,
  ACTOR_URL,
  ACTOR_KEY_URL
} = require("../server/config")({ env: process.env });

// const replyTo = "https://mastodon.social/@lmorchard/100598067502715098";
// const replyTo = "https://botsin.space/@lmorchard/100608732576802402";
const replyTo = "https://toot.lmorchard.com/@tester/100612621416928997";
const replyURL = new url.URL(replyTo);

const body = JSON.stringify({
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": `${SITE_URL}/create-hello-world-${Date.now()}-${Math.random()}`,
  "type": "Create",
  "actor": ACTOR_URL,
  object: {
    "id": `${SITE_URL}/hello-world-${Date.now()}-${Math.random()}`,
    "type": "Note",
    "published": (new Date()).toISOString(),
    "attributedTo": ACTOR_URL,
    "inReplyTo": replyURL.href,
    "to": "https://www.w3.org/ns/activitystreams#Public",
    "content": `<p>Hello world ${Date.now()}-${Math.random()}</p>`
  }
}, null, " ");

const protocol = replyURL.protocol;
const host = replyURL.host;
const path = "/inbox";
const method = "POST";
const headers = {
  "Host": host,
  "Date": (new Date()).toUTCString(),
};

const signature = signRequest({
  keyId: ACTOR_KEY_URL,
  privateKey: PRIVATE_KEY,
  method,
  path,
  headers
});

fetch(`${protocol}//${host}${path}`, {
  method,
  body,
  headers: { ...headers, "Signature": signature }
})
  .then(res => Promise.all([res.status, res.statusText, res.headers.raw(), res.text()]))
  .then(([status, statusText, headers, text]) => console.log({ status, statusText, text }))
  .catch(error => console.log({ error }));