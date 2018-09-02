module.exports = {
  default: ({ ws, data }) => {
    console.log("Unimplemented message", data, ws.id, (ws.user || {}).name);
  },
  pong: ({ ws, data }) => {
    ws.send(
      JSON.stringify({
        parp: "parp"
      })
    );
  }
};
