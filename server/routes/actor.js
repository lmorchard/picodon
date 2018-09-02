const express = require("express");
const {
  requireAuthentication,
  asyncHandler,
  expandObjects
} = require("../lib/utils");
const { verifyRequest } = require("../lib/crypto");
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

  actorRouter.route("/").get((request, response) => {
    response.json(
      LocalActor({
        USERNAME,
        ACTOR_URL,
        ACTOR_KEY_URL,
        PUBLIC_KEY
      })
    );
  });

  actorRouter.route("/objects/:uuid").get(async (req, res) => {
    const { uuid } = req.params;
    console.log("UUID", uuid);
    try {
      const result = await db.objects.findOne({
        _id: ObjectUrl({ baseURL: ACTOR_URL, uuid })
      });
      console.log("RESULT", result);
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

        const objectId = ObjectUrl({ baseURL: ACTOR_URL, uuid: UUID() });
        const activityId = ObjectUrl({ baseURL: ACTOR_URL, uuid: UUID() });

        if (isActivity(incoming)) {
          activity = incoming;
          activity.id = activityId;
          activity.actor = ACTOR_URL;
          activity.published = dateNow();
          object = activity.object;
          object.id = objectId;
        } else {
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

        await db.objects.insert({ _id: object.id, object });
        await db.objects.insert({ _id: activity.id, object: activity });

        console.log("CREATE", activity);

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
          // TODO: log these messages for later review? lots of Deleted actions for users
          return response.status(401).send("HTTP signature not verified");
        }

        // TODO: verify content with source ID/URI

        const activity = body;
        await db.objects.insert({ _id: activity.id, object: activity });

        const object = { ...activity.object, ...activity.context };
        await db.objects.insert({ _id: object.id, object });

        return response.status(202).json({});
      })
    );

  actorRouter.route("/following").get((request, response) => {});

  actorRouter.route("/followers").get((request, response) => {});

  actorRouter.route("/liked").get((request, response) => {});

  app.use(ACTOR_PATH, actorRouter);

  return { ...context };
};
