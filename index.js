const express = require("express");
const server = require("./server");
const config = require("./server/config");

const { app, PORT, HOST } = server(config({
  app: express(),
  env: process.env
}));

app.use(express.static("client/build"));

const listener = app.listen(PORT, () => {
  console.log(`Your wonderful server app is listening on ${HOST}:${PORT}`);
});