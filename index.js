const http = require("http");
const path = require("path");
const express = require("express");
const chokidar = require("chokidar");

// HACK: Increment the port to live alongside webpack proxy
const PORT = parseInt(process.env.PORT, 10) + 1;

// Configure the server without routes.
const config = require("./server/config")({
  env: { ...process.env, PORT }
});
const app = express();
const server = http.createServer(app);
const context = require("./server")({ ...config, app, server });

// HACK: Hit the require() cache on every hit for routes so that
// clearing the cache results in fresh code.
app.use((req, res, next) =>
  require("./server/routes")({
    ...context,
    app: express() // Use a throwaway app for route mounting
  }).app(req, res, next));
  
// Watch server files, clear the require() cache on changes.
const paths = [ "lib", "server" ]
  .map(name => path.join(__dirname, name));
chokidar.watch(paths).on("all", (event, path) => {
  // Only clear require cache entries from our specified paths.
  for (let id of Object.keys(require.cache)) {
    for (let path of paths) {
      if (id.startsWith(path)) {
        delete require.cache[id];
      }
    }
  }
});

// Finally, get our server listening
const { HOST } = context;
server.listen(PORT, () =>
   // eslint-disable-next-line no-console
  console.log(`Dev server is listening on ${HOST}:${PORT}`));
