const express = require("express");
const PQueue = require("p-queue");
const { actions } = require("../lib/store");
const { requireAuthentication } = require("./lib/utils");

module.exports = context => {
  const { app, fetch, sockets } = context;

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

  setInterval(() => {
    sockets.broadcast({
      event: "storeDispatch",
      action: actions.updateQueueStats({
        size: fetchQueue.size,
        pending: fetchQueue.pending,
        isPaused: fetchQueue.isPaused
      })
    });
  }, 2000);

  return { ...context, queues };
};
