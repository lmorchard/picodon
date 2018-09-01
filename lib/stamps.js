/*
TODO:
- signatures?
*/
const uuidv1 = require("uuid/v1");
const { desc } = require("./utils");

const ID_PUBLIC = "https://www.w3.org/ns/activitystreams#Public";
const CONTEXT_ACTIVITY_STREAMS = "https://www.w3.org/ns/activitystreams";
const CONTEXT_W3ID_SECURITY = "https://w3id.org/security/v1";

const UUID = () => uuidv1();

const dateNow = () => new Date().toISOString();

const isActivity = object => "actor" in object && "object" in object;

const activityFindQuery = {
  $and: [
    { "object.actor": { $exists: true } },
    { "object.object": { $exists: true } }
  ]
};

const isAddressedToQuery = actorId => ({
  $or: [
    { "object.to": actorId },
    { "object.to": { $elemMatch: actorId } },
    { "object.cc": actorId },
    { "object.cc": { $elemMatch: actorId } }
  ]
});

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

const BaseObject = ({ id, ...props }) =>
  OmitNulls(
    CommonContext({
      id,
      ...props
    })
  );

// https://www.w3.org/TR/activitypub/#actor-objects
const Actor = props =>
  BaseObject({
    type: "Person",
    ...props
  });

const ActorId = ({ baseUrl, username }) => `${baseUrl}/@${username}`;

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
  BaseObject({
    id,
    actor,
    object: OmitContext(object),
    published,
    ...props
  });

const ActivityCreate = ({ ...props }) => Activity({ type: "Create", ...props });

const ActivityDelete = ({ ...props }) => Activity({ type: "Delete", ...props });

const ActivityFollow = ({ ...props }) => Activity({ type: "Follow", ...props });

const ActivityUndo = ({ ...props }) => Activity({ type: "Undo", ...props });

const ObjectUrl = ({ baseURL, uuid }) => `${baseURL}/objects/${uuid}`;

const ObjectNote = ({ ...props }) => BaseObject({ type: "Note", ...props });

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
  BaseObject({
    type: "Collection",
    items: items.map(OmitContext),
    totalItems: items.length,
    ...props
  });

const OrderedCollection = ({ items = [], ...props }) =>
  BaseObject({
    type: "OrderedCollection",
    orderedItems: items
      .sort((a, b) => desc(a.published, b.published))
      .map(OmitContext),
    totalItems: items.length,
    ...props
  });

module.exports = {
  ID_PUBLIC,
  UUID,
  isActivity,
  activityFindQuery,
  isAddressedToQuery,
  dateNow,
  OmitNulls,
  OmitContext,
  Actor,
  ActorId,
  LocalActor,
  Activity,
  ActivityCreate,
  ActivityDelete,
  ActivityFollow,
  ActivityUndo,
  BaseObject,
  ObjectUrl,
  ObjectNote,
  ObjectFollow,
  ObjectTombstone,
  Collection,
  OrderedCollection
};
