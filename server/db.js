const nedb = require("nedb-promises");

const dbCreate = name =>
  nedb.create({
    filename: `./.data/${name}.db`,
    autoload: true,
    timestampData: true
  });

module.exports = context => {
  const { USERNAME } = context;

  const db = ["objects"].reduce(
    (acc, name) => ({ ...acc, [name]: dbCreate(`${USERNAME}/${name}`) }),
    {}
  );

  return { ...context, db };
};
