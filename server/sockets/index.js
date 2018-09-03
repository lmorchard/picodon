const uuidV4 = require("uuid/v4");
const WebSocket = require("ws");
const expressWs = require("express-ws");

module.exports = context => {
  const { app, server } = context;

  const sockets = expressWs(app, server);

  const openClients = () =>
    Array.from(sockets.getWss("/socket").clients).filter(
      client => client.readyState === WebSocket.OPEN
    );

  sockets.broadcastToAll = message =>
    openClients().forEach(client => client.send(JSON.stringify(message)));

  sockets.broadcastToAuthed = message =>
    openClients()
      .filter(client => !!client.user)
      .forEach(client => client.send(JSON.stringify(message)));

  sockets.sendToUser = (userId, message) =>
    openClients()
      .filter(client => client.user && client.user.id == userId)
      .forEach(client => client.send(JSON.stringify(message)));

  sockets.sendToActors = (actorIds, message) =>
    openClients()
      .filter(client => client.user && actorIds.includes(client.user.actor.id))
      .forEach(client => client.send(JSON.stringify(message)));

  sockets.storeDispatch = action => ({ event: "storeDispatch", action });

  app.ws("/socket", (ws, req) => {
    ws.id = uuidV4();
    ws.user = req.user;
    console.log(
      "WebSocket connection",
      ws.id,
      req.user ? req.user.id : "[unauth]"
    );
    ws.on("message", message => {
      // HACK: require() this for every message to lean on the module
      // cache. The dev server will clear that cache on file changes.
      const socketHandlers = require("./handlers");
      try {
        const data = JSON.parse(message);
        const name = data.event in socketHandlers ? data.event : "default";
        socketHandlers[name]({ ws, data });
      } catch (err) {
        console.log("socket message error", err, message);
      }
    });
  });

  return { ...context, sockets };
};
