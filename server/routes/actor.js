const express = require("express");
const { verifyRequest } = require("../lib/crypto");
const {
  requireAuthentication,
  asyncHandler,
  expandObjects
} = require("../lib/utils");
const {
  ID_PUBLIC,
  isActivity,
  activityFindQuery,
  isAddressedToQuery,
  dateNow,
  UUID,
  LocalActor,
  ObjectUrl,
  OrderedCollection,
  ActivityCreate
} = require("../../lib/stamps");

module.exports = context => {
  const {
    app,
    fetch,
    queues,
    delivery,
    db,
    USERNAME,
    ACTOR_KEY_URL,
    PUBLIC_KEY,
    ACTOR_PATH,
    ACTOR_URL
  } = context;

  const actorRouter = express.Router();

  const queryPublicForUnauthed = request =>
    request.isAuthenticated() && request.user.actor.id === ACTOR_URL
      ? {}
      : isAddressedToQuery(ID_PUBLIC);

  const localActor = LocalActor({
    USERNAME,
    ACTOR_URL,
    ACTOR_KEY_URL,
    PUBLIC_KEY
  });

  actorRouter.route("/").get((request, response) => response.json(localActor));

  actorRouter.route("/objects/:uuid").get(async (req, res) => {
    const { uuid } = req.params;
    try {
      const result = await db.objects.findOne({
        _id: ObjectUrl({ baseURL: ACTOR_URL, uuid })
      });
      res.json(result.object);
    } catch (e) {
      res.status(404).send({ status: "NOT FOUND" });
    }
  });

  // https://www.w3.org/TR/activitypub/#outbox
  actorRouter
    .route("/outbox")
    .get(
      asyncHandler(async (request, response) => {
        let items = await db.objects
          .find({
            $and: [
              { "object.actor": ACTOR_URL },
              activityFindQuery,
              queryPublicForUnauthed(request)
            ]
          })
          .sort({ "object.published": -1 })
          .limit(15);

        items = items.map(item => item.object);
        if (request.query.expand) {
          items = await expandObjects(queues.fetchHigh, items);
        }
        response.json(OrderedCollection({ items }));
      })
    )
    .post(
      requireAuthentication,
      asyncHandler(async (req, res) => {
        const incoming = req.body;

        // TODO: some schema validation here
        let object, activity;

        if (isActivity(incoming)) {
          activity = incoming;
          object = activity.object;
        } else {
          // Assume the incoming is a bare object,
          // wrap it in a Create activity
          object = incoming;
          object.id = objectId;
          activity = ActivityCreate({
            id: activityId,
            actor: ACTOR_URL,
            to: object.to,
            cc: object.cc,
            bto: object.bto,
            bcc: object.bcc,
            audience: object.audience,
            published: dateNow(),
            object
          });
        }

        // Enforce some server-generated properties.
        const activityId = ObjectUrl({ baseURL: ACTOR_URL, uuid: UUID() });
        const objectId = ObjectUrl({ baseURL: ACTOR_URL, uuid: UUID() });
        activity.id = activityId;
        activity.actor = ACTOR_URL;
        if (activity.type === "Create") {       
          object.id = objectId;
        }

        delivery.toOutbox({ activity });

        res
          .status(201)
          .set({ Location: object.url })
          .json({ status: "ok" });
      })
    );

  // https://www.w3.org/TR/activitypub/#inbox
  actorRouter
    .route("/inbox")
    .get(
      asyncHandler(async (request, response) => {
        let items = await db.objects
          .find({
            $and: [
              activityFindQuery,
              isAddressedToQuery(ACTOR_URL),
              queryPublicForUnauthed(request)
            ]
          })
          .sort({ "object.published": -1 })
          .limit(15);

        items = items.map(item => item.object);
        if (request.query.expand) {
          items = await expandObjects(queues.fetchHigh, items);
        }
        response.json(OrderedCollection({ items }));
      })
    )
    .post(
      asyncHandler(async (request, response) => {
        const { method, originalUrl: path, headers, body } = request;

        const requestVerified = await verifyRequest({
          fetch,
          method,
          path,
          headers
        });
        if (!requestVerified) {
          return response.status(401).send("HTTP signature not verified");
        }

        const activity = body;
        console.log("INBOX ACTIVITY", body);
        delivery.toInbox({ activity });

        return response.status(202).json({});
      })
    );

  actorRouter.route("/following").get((request, response) => {});

  actorRouter.route("/followers").get((request, response) => {});

  actorRouter.route("/liked").get((request, response) => {});

  app.use(ACTOR_PATH, actorRouter);

  return { ...context };
};
