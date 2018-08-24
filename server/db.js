const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const nedb = require("nedb-promises");

const dbCreate = name =>
  nedb.create({
    filename: `./.data/${name}.db`,
    autoload: true,
    timestampData: true
  });

module.exports = context => {
  const { USERNAME } = context;
  
  const db = [
    "outbox",
    "inbox",
    "followers",
    "following",
    "liked",
    "likes",
    "shares"
  ].reduce((acc, name) =>
    ({ ...acc, [name]: dbCreate(`${USERNAME}/${name}`) }),
    {}
  );
  
  return { ...context, db };
}