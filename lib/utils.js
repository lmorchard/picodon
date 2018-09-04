// eslint-disable-next-line no-nested-ternary
exports.asc = (a, b) => (a < b ? -1 : b < a ? 1 : 0);

exports.desc = (a, b) => exports.asc(b, a);

exports.coerceArray = thing => {
  if (!thing) {
    return [];
  }
  return Array.isArray(thing) ? thing : [thing];
};
