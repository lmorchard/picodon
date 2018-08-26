const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)

module.exports = config => {
  const { app } = config;
  
  app.use(morgan("tiny"));
  app.use(bodyParser.json({ type: [
    "application/json",
    "application/*+json" 
  ]}));
  app.use(bodyParser.text({ type: "*/*" }));

  return { ...config };
}