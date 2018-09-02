const express = require("express");
const PQueue = require("p-queue");
const { requireAuthentication } = require("./lib/utils");

module.exports = context => {
  const { app, fetch } = context;

  const fetchQueue = new PQueue({
    concurrency: 4
  });

  const queues = {
    fetch: (...args) => fetchQueue.add(() => fetch(...args)),
    fetchHigh: (...args) =>
      fetchQueue.add(() => fetch(...args), { priority: 10 }),
    fetchLow: (...args) =>
      fetchQueue.add(() => fetch(...args), { priority: -10 })
  };

  const queueRouter = express.Router();

  queueRouter.route("/queues").get(requireAuthentication, (req, res) => {
    res.json({
      fetch: {
        size: fetchQueue.size,
        pending: fetchQueue.pending,
        isPaused: fetchQueue.isPaused
      }
    });
  });

  app.use("/", queueRouter);

  return { ...context, queues };
};
