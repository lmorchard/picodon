const express = require("express");
const { LocalActor, UUID, ObjectUrl } = require("../../lib/stamps");
const { verifyRequest } = require("../lib/crypto");
const { asyncHandler } = require("../middleware");

module.exports = context => {
  const {
    app,
    db,
    USERNAME,
    ACTOR_KEY_URL,
    PUBLIC_KEY,
    ACTOR_PATH,
    ACTOR_URL
  } = context;
  
  const actorRouter = express.Router();

  actorRouter.route("/").get((request, response) => {
    response.json(LocalActor({
      USERNAME,
      ACTOR_URL,
      ACTOR_KEY_URL,
      PUBLIC_KEY
    }));
  });
   
  actorRouter.route("/objects/:uuid")
    .get(async (req, res) => {
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
    .get((request, response) => {
      response.json({ FOO: "FOOO12" });
    })
    .post(async (req, res) => {
      console.log("BODY", req.body);
      const { object } = req.body;

      if (!object.id) {
        const objectUUID = UUID();
        const objectURL = ObjectUrl({
          baseURL: ACTOR_URL,
          uuid: objectUUID
        });
        Object.assign(object, {
          id: objectURL,
          url: objectURL,
        });
      }

      console.log("OBJECT", object);
    
      await db.objects.insert({ _id: object.id, object });
    
      res.status(201)
        .set({ "Location": object.url })
        .json({ status: "ok" });
    });

  // https://www.w3.org/TR/activitypub/#inbox
  actorRouter.route("/inbox").post(
    asyncHandler(async (request, response) => {
      const { method, originalUrl: path, headers, body } = request;
      console.log("ACTOR INBOX POST", { headers, body }); // eslint-disable-line no-console
      const requestVerified = await verifyRequest({ method, path, headers });
      if (!requestVerified) {
        // TODO: log these messages for later review? lots of Deleted actions for users
        return response.status(401).send("HTTP signature not verified");
      }
      return response.status(202).json({});
    })
  );

  actorRouter.route("/following").get((request, response) => {});

  actorRouter.route("/followers").get((request, response) => {});

  actorRouter.route("/liked").get((request, response) => {});

  app.use(ACTOR_PATH, actorRouter);

  return { ...context };
};
