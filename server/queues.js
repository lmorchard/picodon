const PQueue = require("p-queue");
const { actions } = require("../lib/store");

module.exports = context => {
  const { fetch, sockets } = context;

  const deliveryQueue = new PQueue({
    concurrency: 4
  });

  const fetchQueue = new PQueue({
    concurrency: 4
  });

  const queues = {
    deliveryQueue,
    fetchQueue,
    fetch: (...args) => fetchQueue.add(() => fetch(...args)),
    fetchHigh: (...args) =>
      fetchQueue.add(() => fetch(...args), { priority: 10 }),
    fetchLow: (...args) =>
      fetchQueue.add(() => fetch(...args), { priority: -10 })
  };

  const queueStats = queue => ({
    size: queue.size,
    pending: queue.pending,
    isPaused: queue.isPaused
  });

  let currentStats = null;
  setInterval(() => {
    const previousStats = currentStats;
    currentStats = {
      fetch: queueStats(fetchQueue),
      delivery: queueStats(deliveryQueue)
    };
    if (JSON.stringify(currentStats) !== JSON.stringify(previousStats)) {
      sockets.broadcastToAuthed(
        sockets.storeDispatch(
          actions.updateQueueStats(currentStats)
        )
      );
    }
  }, 250);

  return { ...context, queues };
};
