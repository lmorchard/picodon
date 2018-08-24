/*
TODO:
- signatures?
*/
const ID_PUBLIC = "https://www.w3.org/ns/activitystreams#Public";
const CONTEXT_ACTIVITY_STREAMS = "https://www.w3.org/ns/activitystreams";
const CONTEXT_W3ID_SECURITY = "https://w3id.org/security/v1";

const CommonContext = ({ ...props }) => ({
  "@context": [
    CONTEXT_ACTIVITY_STREAMS,
    CONTEXT_W3ID_SECURITY
  ],
  ...props
});

const OmitContext = ({ ["@context"]: _, ...props } = {}) => props;

const OmitNulls = props => Object.entries(props).reduce(
  (acc, [key, value]) => value === null ? acc : { ...acc, [key]: value },
  {}
);

const Base = props => OmitNulls(CommonContext(props));

// https://www.w3.org/TR/activitypub/#actor-objects
const Actor = props => Base({
  "type": "Person",
  ...props
});

const LocalActor = ({ USERNAME, ACTOR_URL, ACTOR_KEY_URL, PUBLIC_KEY, ...props }) => Actor({
  "id": ACTOR_URL,
  "name": USERNAME,
  /*
  "summary": "summary goes here",
  "icon": [
    "https://kenzoishii.example.com/image/165987aklre4"
  ],
  */
  "preferredUsername": USERNAME,
  "inbox": `${ACTOR_URL}/inbox`,
  "outbox": `${ACTOR_URL}/outbox`,
  "following": `${ACTOR_URL}/following`,
  "followers": `${ACTOR_URL}/followers`,
  "liked": `${ACTOR_URL}/liked`,
  "publicKey": {
    "id": ACTOR_KEY_URL,
    "owner": ACTOR_URL,
    "publicKeyPem": PUBLIC_KEY
  },
  ...props
});

const Activity = ({ id, actor, object, published, ...props }) => Base({
  id,
  object: OmitContext(object),
  "to": [
    "https://www.w3.org/ns/activitystreams#Public"
  ],
  "cc": [
    "https://toot.cafe/users/lmorchard/followers",
    "https://sunset-screen.glitch.me/@botbot"
  ],
  published,
  ...props
});

const ActivityCreate = ({ ...props }) => Activity({ "type": "Create", ...props });

const ActivityDelete = ({ ...props }) => Activity({ "type": "Delete", ...props });

const ActivityFollow = ({ ...props }) => Activity({ "type": "Follow", ...props });

const ActivityUndo = ({ ...props }) => Activity({ "type": "Undo", ...props });

const BaseObject = data => Base({
  ...data
});

const ObjectNote = data => BaseObject({
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
});

const ObjectFollow = ({ actor, object, ...props }) => BaseObject({
  actor,
  object,
  ...props
});

const ObjectTombstone = ({ deleted, ...props }) => BaseObject({
  deleted,
  ...props
});

const Collection = ({ summary = "", items = [], ...props }) => Base({
  summary: summary,
  type: "Collection",
  items,
  totalItems: items.length,
  ...props
});

const OrderedCollection = ({ items = [], ...props }) => Collection({
  type: "OrderedCollection",
  items: null,
  orderedItems: items,
  totalItems: items.length,
  props
});

module.exports = {
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