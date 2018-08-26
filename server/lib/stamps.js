/*
TODO:
- signatures?
*/
const uuidv1 = require("uuid/v1");

const ID_PUBLIC = "https://www.w3.org/ns/activitystreams#Public";
const CONTEXT_ACTIVITY_STREAMS = "https://www.w3.org/ns/activitystreams";
const CONTEXT_W3ID_SECURITY = "https://w3id.org/security/v1";

const UUID = () => uuidv1();

const CommonContext = ({ ...props }) => ({
  "@context": [CONTEXT_ACTIVITY_STREAMS, CONTEXT_W3ID_SECURITY],
  ...props
});

const OmitContext = ({ ["@context"]: _, ...props } = {}) => props;

const OmitNulls = props =>
  Object.entries(props).reduce(
    (acc, [key, value]) => (value === null ? acc : { ...acc, [key]: value }),
    {}
  );

const Base = ({ id, ...props }) =>
  OmitNulls(
    CommonContext({
      id,
      ...props
    })
  );

// https://www.w3.org/TR/activitypub/#actor-objects
const Actor = props =>
  Base({
    type: "Person",
    ...props
  });

const LocalActor = ({
  USERNAME,
  ACTOR_URL,
  ACTOR_KEY_URL,
  PUBLIC_KEY,
  ...props
}) =>
  Actor({
    id: ACTOR_URL,
    name: USERNAME,
    /*
  "summary": "summary goes here",
  "icon": [
    "https://kenzoishii.example.com/image/165987aklre4"
  ],
  */
    preferredUsername: USERNAME,
    inbox: `${ACTOR_URL}/inbox`,
    outbox: `${ACTOR_URL}/outbox`,
    following: `${ACTOR_URL}/following`,
    followers: `${ACTOR_URL}/followers`,
    liked: `${ACTOR_URL}/liked`,
    publicKey: {
      id: ACTOR_KEY_URL,
      owner: ACTOR_URL,
      publicKeyPem: PUBLIC_KEY
    },
    ...props
  });

const Activity = ({ id, actor, object, published, ...props }) =>
  Base({
    id,
    object: OmitContext(object),
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [
      "https://toot.cafe/users/lmorchard/followers",
      "https://sunset-screen.glitch.me/@botbot"
    ],
    published,
    ...props
  });

const ActivityCreate = ({ ...props }) => Activity({ type: "Create", ...props });

const ActivityDelete = ({ ...props }) => Activity({ type: "Delete", ...props });

const ActivityFollow = ({ ...props }) => Activity({ type: "Follow", ...props });

const ActivityUndo = ({ ...props }) => Activity({ type: "Undo", ...props });

const BaseObject = data =>
  Base({
    ...data
  });

const ObjectNote = data =>
  BaseObject({
    id: "https://toot.cafe/users/lmorchard/statuses/100603101528141835",
    type: "Note",
    summary: null,
    inReplyTo:
      "https://sunset-screen.glitch.me/hello-world-1535064966531-0.9144156649480082",
    published: "2018-08-24T03:31:45Z",
    url: "https://toot.cafe/@lmorchard/100603101528141835",
    attributedTo: "https://toot.cafe/users/lmorchard",
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [
      "https://toot.cafe/users/lmorchard/followers",
      "https://sunset-screen.glitch.me/@botbot"
    ],
    sensitive: false,
    atomUri: "https://toot.cafe/users/lmorchard/statuses/100603101528141835",
    inReplyToAtomUri:
      "https://sunset-screen.glitch.me/hello-world-1535064966531-0.9144156649480082",
    conversation:
      "tag:toot.cafe,2018-08-23:objectId=4024422:objectType=Conversation",
    content:
      '<p><span class="h-card"><a href="https://sunset-screen.glitch.me/@botbot" class="u-url mention">@<span>botbot</span></a></span> test please ignore again</p>',
    attachment: [],
    tag: [
      {
        type: "Mention",
        href: "https://sunset-screen.glitch.me/@botbot",
        name: "@botbot@sunset-screen.glitch.me"
      }
    ]
  });

const ObjectFollow = ({ actor, object, ...props }) =>
  BaseObject({
    actor,
    object,
    ...props
  });

const ObjectTombstone = ({ deleted, ...props }) =>
  BaseObject({
    deleted,
    ...props
  });

const Collection = ({ items = [], ...props }) =>
  Base({
    type: "Collection",
    items: items.map(OmitContext),
    totalItems: items.length,
    ...props
  });

const OrderedCollection = ({ items = [], ...props }) =>
  Base({
    type: "OrderedCollection",
    orderedItems: items.map(OmitContext),
    totalItems: items.length,
    ...props
  });

module.exports = {
  ID_PUBLIC,
  UUID,
  OmitNulls,
  OmitContext,
  Actor,
  LocalActor,
  Activity,
  ActivityCreate,
  ActivityDelete,
  ActivityFollow,
  ActivityUndo,
  BaseObject,
  ObjectNote,
  ObjectFollow,
  ObjectTombstone,
  OrderedCollection
};

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
