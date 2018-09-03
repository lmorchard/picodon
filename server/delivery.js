const { URL } = require("url");
// const PQueue = require("p-queue");
const {
  fetchJson,
  expandObjects,
  dereferenceId,
  coerceArray,
  promiseMap
} = require("./lib/utils");
const { actions } = require("../lib/store");
const { ID_PUBLIC } = require("../lib/stamps");
const { signRequest } = require("./lib/crypto");
const fetch = require("node-fetch");

module.exports = context => {
  const { PRIVATE_KEY, ACTOR_KEY_URL, db, queues, sockets } = context;
  const { deliveryQueue /* , fetchLow */, fetchHigh } = queues;

  const deliverToInbox = async ({ activity }) => {
    // TODO: validate schema?
    // TODO: verify content with source ID/URI

    console.log("DELIVERY!", activity);

    // Deliver to the database
    try {
      await db.objects.insert({ _id: activity.id, object: activity });
    } catch (e) {
      /* no-op */
      // catch error for duplicate keys, maybe accept edits for Update
    }

    const expanded = await expandObjects(queues.fetchLow, [activity]);
    const expandedActivity = expanded[0];

    // Deliver to any connected websockets
    ["to", "cc"].forEach(propName => {
      console.log("DELIVER TO INBOX", propName, activity[propName]);
      sockets.sendToActors(
        coerceArray(activity[propName]),
        sockets.storeDispatch(actions.pushInbox(expandedActivity))
      );
    });
  };

  const deliverToOutbox = async ({ activity }) => {
    const object = activity.object;

    // Deliver to the database
    try {
      await db.objects.insert({ _id: object.id, object });
      await db.objects.insert({ _id: activity.id, object: activity });
    } catch (e) {
      /* no-op */
      // catch error for duplicate keys, maybe accept edits for Update
    }

    // Deliver to any connected websockets
    const actor = await fetchJson(fetchHigh, activity.actor);

    // Get unique set of destination actor IDs
    const idSet = new Set();
    for (let propName of ["actor", "to", "cc", "bto", "bcc"]) {
      coerceArray(activity[propName]).forEach(id => idSet.add(id));
    }
    const ids = Array.from(idSet.values()).filter(id => id !== ID_PUBLIC);

    // Deliver to any local actors connected via websocket
    sockets.sendToActors(
      [ids],
      sockets.storeDispatch(actions.pushOutbox({ ...activity, actor }))
    );

    // Dereference all the remote actors.
    const actors = await promiseMap(
      ids /* .filter(id => id !== activity.actor) */,
      id => dereferenceId(fetchHigh, id)
    );

    // Find all the actors' inboxes
    const inboxes = actors.reduce(
      (acc, actor) => (actor.inbox ? [...acc, actor.inbox] : acc),
      []
    );

    const body = JSON.stringify(activity);

    const sendToInbox = inbox => {
      const inboxUrl = new URL(inbox);
      const { protocol, host, pathname, search } = inboxUrl;
      const path = pathname + search;
      console.log("INBOX", inbox, protocol, host, path);
      const method = "POST";
      const headers = {
        Host: host,
        Date: new Date().toUTCString()
      };
      const signature = signRequest({
        // TODO: look these up somehow, rather than hardcode
        keyId: ACTOR_KEY_URL,
        privateKey: PRIVATE_KEY,
        method,
        path,
        headers
      });
      const options = {
        method,
        body,
        headers: {
          ...headers,
          Signature: signature
        }
      };
      console.log("FETCH", inbox, `${protocol}//${host}${path}`, options);
      return fetch(`${protocol}//${host}${path}`, options);
    };

    const result = await promiseMap(inboxes, sendToInbox);

    console.log(activity);
    console.log(result.map(response => response.status));
  };

  const delivery = {
    toInbox: (...args) =>
      deliveryQueue.add(() => deliverToInbox(...args), { priority: -10 }),
    toOutbox: (...args) =>
      deliveryQueue.add(() => deliverToOutbox(...args), { priority: 10 })
  };

  return { ...context, delivery };
};
