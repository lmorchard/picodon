const http = require("http");
const path = require("path");
const express = require("express");
const chokidar = require("chokidar");

const PORT = parseInt(process.env.PORT, 10) + 1;
const context = require("./server/config")({
  env: { ...process.env, PORT }
});

const app = express();
context.app = app;
context.server = http.createServer(app);
context.wss = require("./server/sockets")(context);
// TODO: move more things here out of the ./server modules 
// that shouldn't be reloaded?

app.use(express.static("client/build"));

// This weird little indirect middleware leans on node's require() cache
// for every request, so that clearing the cache results in fresh code
app.use((req, res, next) => 
  require("./server")(context)(req, res, next));

// These are paths where server-related modules live
const paths = [ "lib", "server" ]
  .map(name => path.join(__dirname, name));

// Set up a file watcher on the paths.
const watcher = chokidar.watch(paths, {
  usePolling: true,
  interval: 1000,
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 500
  }
});

// Whenever anything happens to any file, clear the require()
// cache for *all* watched paths.
watcher.on("ready", () => {
  watcher.on("all", (event, path) => {
    console.log("Clearing require() cache for server");
    Object.keys(require.cache)
      .filter(id => paths.filter(path => id.startsWith(path)).length > 0)
      .forEach(id => delete require.cache[id]);
  });
});

const { server, HOST } = context;
server.listen(PORT, () =>
   // eslint-disable-next-line no-console
  console.log(`Dev server is listening on ${HOST}:${PORT}`));
