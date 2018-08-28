const express = require("express");
const server = require("./server");
const config = require("./server/config");

const { app, PORT, HOST } = server(config({ env: process.env }));
app.use(express.static("client/build"));
app.listen(PORT, () =>
   // eslint-disable-next-line no-console
  console.log(`Your wonderful server app is listening on ${HOST}:${PORT}`));
