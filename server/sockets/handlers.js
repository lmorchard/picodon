module.exports = {
  logout: ({ ws }) => {
    ws.close();
  },
  default: ({ ws, data }) => {
    console.log("Unimplemented message", data, ws.id, (ws.user || {}).id);
  }
};
