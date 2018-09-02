const http = require("http");
const path = require("path");
const express = require("express");
const chokidar = require("chokidar");

// HACK: Increment the port to live alongside webpack proxy
const PORT = parseInt(process.env.PORT, 10) + 1;

// First, configure the server without routes.
const app = express();
const server = http.createServer(app);
const context = require("./server")(
  {
    ...require("./server/config")({
      env: { ...process.env, PORT }
    }),
    app,
    server
  }
);

// This weird little indirect middleware leans on node's require() cache
// for every request, so that clearing the cache results in fresh code
// for the server routes because they're frequently edited.
app.use((req, res, next) => {
  const routesApp = express();
  const routesContext =
    require("./server/routes")({ ...context, app: routesApp });
  return routesApp(req, res, next);
});
  
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

const { HOST } = context;
server.listen(PORT, () =>
   // eslint-disable-next-line no-console
  console.log(`Dev server is listening on ${HOST}:${PORT}`));
