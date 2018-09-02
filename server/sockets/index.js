const uuidV4 = require("uuid/v4");
const expressWs = require("express-ws");

module.exports = context => {
  const { app, server } = context;

  const wss = expressWs(app, server);

  app.ws("/socket", (ws, req) => {
    ws.id = uuidV4();
    // ws.user = req.user;
    console.log("WebSocket connection %s from %s", ws.id, req.user);
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

  const aWss = wss.getWss("/socket");

  setInterval(() => {
    aWss.clients.forEach(client => {
      client.send(
        JSON.stringify({
          event: "ping",
          text: "PING"
        })
      );
    });
  }, 1000);

  return wss;
};
