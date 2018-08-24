const crypto = require("crypto");
const fetch = require("node-fetch");

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

const object = {
  "id": `${SITE_URL}/hello-world-${Date.now()}-${Math.random()}`,
  "type": "Note",
  "published": (new Date()).toISOString(),
  "attributedTo": ACTOR_URL,
  "inReplyTo": "https://toot.cafe/@lmorchard/100602010694218819",
  "content": `<p>Hello world ${Date.now()}-${Math.random()}</p>`,
  "to": "https://www.w3.org/ns/activitystreams#Public"
};

const createHelloWorld = {
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": `${SITE_URL}/create-hello-world-${Date.now()}-${Math.random()}`,
  "type": "Create",
  "actor": `${SITE_URL}/actor`,
  object
};

const signRequest = ({ keyId, host, path, date }) => {
  const signed_string = `(request-target): post ${path}\nhost: ${host}\ndate: ${date}`;
  const sign = crypto.createSign("SHA256");
  sign.update(signed_string);
  const signature = sign.sign(PRIVATE_KEY, "base64");
  return `keyId="${keyId}",headers="(request-target) host date",signature="${signature}"`;
};

const document = JSON.stringify(createHelloWorld);

const date = (new Date()).toUTCString();
const host = "toot.cafe";
const path = "/inbox";
const signature = signRequest({ keyId: ACTOR_KEY_URL, date, path, host });

fetch(`https://${host}${path}`, {
  method: "POST",
  body: document,
  headers: {
    "Host": host,
    "Date": date,
    "Signature": signature
  }
})
  .then(res => [res.status, res.statusText, res.headers.raw(), res.text()])
  .then(([status, statusText, headers, text]) => console.log({ status, statusText, text }))
  .catch(error => console.log({ error }));

/* RESPONSE
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
    {
      "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
      "sensitive": "as:sensitive",
      "movedTo": "as:movedTo",
      "Hashtag": "as:Hashtag",
      "ostatus": "http://ostatus.org#",
      "atomUri": "ostatus:atomUri",
      "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
      "conversation": "ostatus:conversation",
      "toot": "http://joinmastodon.org/ns#",
      "Emoji": "toot:Emoji",
      "focalPoint": {
        "@container": "@list",
        "@id": "toot:focalPoint"
      },
      "featured": "toot:featured",
      "schema": "http://schema.org#",
      "PropertyValue": "schema:PropertyValue",
      "value": "schema:value"
    }
  ],
  "id": "https://toot.cafe/users/lmorchard/statuses/100603101528141835/activity",
  "type": "Create",
  "actor": "https://toot.cafe/users/lmorchard",
  "published": "2018-08-24T03:31:45Z",
  "to": [
    "https://www.w3.org/ns/activitystreams#Public"
  ],
  "cc": [
    "https://toot.cafe/users/lmorchard/followers",
    "https://sunset-screen.glitch.me/@botbot"
  ],
  "object": {
    "id": "https://toot.cafe/users/lmorchard/statuses/100603101528141835",
    "type": "Note",
    "summary": null,
    "inReplyTo": "https://sunset-screen.glitch.me/hello-world-1535064966531-0.9144156649480082",
    "published": "2018-08-24T03:31:45Z",
    "url": "https://toot.cafe/@lmorchard/100603101528141835",
    "attributedTo": "https://toot.cafe/users/lmorchard",
    "to": [
      "https://www.w3.org/ns/activitystreams#Public"
    ],
    "cc": [
      "https://toot.cafe/users/lmorchard/followers",
      "https://sunset-screen.glitch.me/@botbot"
    ],
    "sensitive": false,
    "atomUri": "https://toot.cafe/users/lmorchard/statuses/100603101528141835",
    "inReplyToAtomUri": "https://sunset-screen.glitch.me/hello-world-1535064966531-0.9144156649480082",
    "conversation": "tag:toot.cafe,2018-08-23:objectId=4024422:objectType=Conversation",
    "content": "<p><span class=\"h-card\"><a href=\"https://sunset-screen.glitch.me/@botbot\" class=\"u-url mention\">@<span>botbot</span></a></span> test please ignore again</p>",
    "contentMap": {
      "en": "<p><span class=\"h-card\"><a href=\"https://sunset-screen.glitch.me/@botbot\" class=\"u-url mention\">@<span>botbot</span></a></span> test please ignore again</p>"
    },
    "attachment": [
      
    ],
    "tag": [
      {
        "type": "Mention",
        "href": "https://sunset-screen.glitch.me/@botbot",
        "name": "@botbot@sunset-screen.glitch.me"
      }
    ]
  },
  "signature": {
    "type": "RsaSignature2017",
    "creator": "https://toot.cafe/users/lmorchard#main-key",
    "created": "2018-08-24T03:31:45Z",
    "signatureValue": "udjnVUdPRNDVao2gQl/lsneqlzeCWFPRuh0n5SW/YjaV7fdykCPPvmLZcb35dj6qsHyKpmAz6U4k3sLbQREprgYvQNi38dTYIYvqgWz6H2FuMwbBaYZ5l9ccOk3HECPxK0ZHmit/r1HgBheqsyUYxcTQ8g4Nmk+xW7909j1ZdpeL5VMlaZLMYTD7Y0zH+5TDnD8ScheVfs8h+qB9gEbh/QOyCTkEm6Qmi+ItPUauPmMzOAMzPnQfOVjjjlDaNkKx9Tw7KSyoTIve+jbAgq8yYUg2oP6/RBYop68K0Rm3VzgcLqWG/+EAV+bFj4lLdqHvyzz5i0IHm98ptfSMgOGsWA=="
  }
}
*/

/* DELETE
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
    {
      "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
      "sensitive": "as:sensitive",
      "movedTo": "as:movedTo",
      "Hashtag": "as:Hashtag",
      "ostatus": "http://ostatus.org#",
      "atomUri": "ostatus:atomUri",
      "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
      "conversation": "ostatus:conversation",
      "toot": "http://joinmastodon.org/ns#",
      "Emoji": "toot:Emoji",
      "focalPoint": {
        "@container": "@list",
        "@id": "toot:focalPoint"
      },
      "featured": "toot:featured",
      "schema": "http://schema.org#",
      "PropertyValue": "schema:PropertyValue",
      "value": "schema:value"
    }
  ],
  "id": "https://toot.cafe/users/lmorchard/statuses/100603101528141835#delete",
  "type": "Delete",
  "actor": "https://toot.cafe/users/lmorchard",
  "object": {
    "id": "https://toot.cafe/users/lmorchard/statuses/100603101528141835",
    "type": "Tombstone",
    "atomUri": "https://toot.cafe/users/lmorchard/statuses/100603101528141835"
  },
  "signature": {
    "type": "RsaSignature2017",
    "creator": "https://toot.cafe/users/lmorchard#main-key",
    "created": "2018-08-24T03:31:56Z",
    "signatureValue": "RzZv0hdcNR1GjSQMSm440oxKymsdsdThcnAT8GDNOIyPUzOiYxrhRfdONaYOid7urHN2MHLhinEblr7RiAt3ZYoXx2PabpTV//GU4CMWUBIG/cFkZYdvfYQZe60SgKS8AslHcv//XmBWkhxVNbRIlTerMZSXG9AceLCBp45Dzj2Wa6WF/X9BXByD63kJU+gr1DpbXhUeQP76hZOxo+Bdq5eOSVtPZqQLcKzuGQXH+hRsUYdYNYsr8HtTgPJtOpLSCsPjr9s0au9Ji9SWhSqstHQie1bAo4tetV3CvbyU7GaBEgIogbehqsUQz794EtDv7W93w1aedQBbW37Yht1ydw=="
  }
}
*/

/* FOLLOW
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
    {
      "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
      "sensitive": "as:sensitive",
      "movedTo": "as:movedTo",
      "Hashtag": "as:Hashtag",
      "ostatus": "http://ostatus.org#",
      "atomUri": "ostatus:atomUri",
      "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
      "conversation": "ostatus:conversation",
      "toot": "http://joinmastodon.org/ns#",
      "Emoji": "toot:Emoji",
      "focalPoint": {
        "@container": "@list",
        "@id": "toot:focalPoint"
      },
      "featured": "toot:featured",
      "schema": "http://schema.org#",
      "PropertyValue": "schema:PropertyValue",
      "value": "schema:value"
    }
  ],
  "id": "https://toot.cafe/009e240e-5097-47b3-852a-a821c03f7586",
  "type": "Follow",
  "actor": "https://toot.cafe/users/lmorchard",
  "object": "https://sunset-screen.glitch.me/@botbot",
  "signature": {
    "type": "RsaSignature2017",
    "creator": "https://toot.cafe/users/lmorchard#main-key",
    "created": "2018-08-24T03:34:57Z",
    "signatureValue": "v8UKhz6PjLqU6USQZ6vbGCubwizg+7QY5z3LQNTJhTMOgEpji0nalAB3W3Lvo2+urGzN4Ogw+HFvowN/gTgSgL6c1ZjY7tS3pMLio0DrmvBYhYR7lnrlbl4ZPNRTOtC2VnS6kmfp6zKot4KtiO5TUwG6xDg7OAxwfuGuejnpfjCABzKlfF5GBpgs67PDXEGG8rb9LvNwBXg3pVgkFM+qv+1tVP9UGohE3faKZRmsaa7fjK9UFKSP4Dr9oiUaTYQT+z0m0D2dcN3JGyYNtP2uxdyWih48U6Dj6o8ys6rnszD8wTORLOXjTmN6dNEN9noYQhjNRNcaopya0CO3zG1F0A=="
  }
}
*/

/* UNFOLLOW
{
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
    {
      "manuallyApprovesFollowers": "as:manuallyApprovesFollowers",
      "sensitive": "as:sensitive",
      "movedTo": "as:movedTo",
      "Hashtag": "as:Hashtag",
      "ostatus": "http://ostatus.org#",
      "atomUri": "ostatus:atomUri",
      "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
      "conversation": "ostatus:conversation",
      "toot": "http://joinmastodon.org/ns#",
      "Emoji": "toot:Emoji",
      "focalPoint": {
        "@container": "@list",
        "@id": "toot:focalPoint"
      },
      "featured": "toot:featured",
      "schema": "http://schema.org#",
      "PropertyValue": "schema:PropertyValue",
      "value": "schema:value"
    }
  ],
  "id": "https://toot.cafe/users/lmorchard#follows/21285/undo",
  "type": "Undo",
  "actor": "https://toot.cafe/users/lmorchard",
  "object": {
    "id": "https://toot.cafe/d8acaae5-547c-456e-83ae-66ab1c631b46",
    "type": "Follow",
    "actor": "https://toot.cafe/users/lmorchard",
    "object": "https://sunset-screen.glitch.me/@botbot"
  },
  "signature": {
    "type": "RsaSignature2017",
    "creator": "https://toot.cafe/users/lmorchard#main-key",
    "created": "2018-08-24T03:40:05Z",
    "signatureValue": "g1XepSGzm8kdjNoMrZm775hLjtJyc5A2QYPsSr3aqUAodJ81IneKwvLRPpITO3dSTciHTVHZ/Egb6m6qfzA/MXIoXtWmjIc4+Uq0D/8cCIVJE8GwtY7k1HGro7WsKqFt9cF8Y8h0r/bnuobUbZ6YCc66PXWx/T2kW6sDQeirMHC4DJbWWFDpQywA4XR/RjV7Nzj2Pjv/2uIGcM0FB6C2k1VCbe/drpbEh0hVX82TKvDqnzSf2CCJfgbkdCzKDjjGILoMmWWbenEMrYfHxDJPE/w0fPMaVPzRxI9dIoBnmbAKF5b5wnxX2wgB7tCS2hAH1Nvv8Lqexu81Fw/llNJVlw=="
  }
}
*/