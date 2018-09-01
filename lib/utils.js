// eslint-disable-next-line no-nested-ternary
const asc = (a, b) => (a < b ? -1 : b < a ? 1 : 0);

const desc = (a, b) => asc(b, a);

module.exports = {
  asc,
  desc
};
