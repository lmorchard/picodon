const OrderedCollection = ({ summary = "", items = [] }) => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  summary: summary,
  type: "OrderedCollection",
  totalItems: items.length,
  orderedItems: items
});

module.exports = { OrderedCollection };
