import { actions } from "../../lib/store";

let socket, reconnectInterval;

export const socketSend = (event, data = {}) => {
  if (!(socket && socket.readyState === WebSocket.OPEN)) return;
  socket.send(JSON.stringify({ ...data, event }));
};

export function setupWebSocket(store) {
  const {
    setSocketConnecting,
    setSocketConnected,
    setSocketDisconnected
  } = actions;

  if (socket && socket.readyState === WebSocket.OPEN) {
    socketSend("logout");
    socket.close();
  }

  if (!reconnectInterval) {
    reconnectInterval = setInterval(() => {
      if (socket && socket.readyState === WebSocket.CLOSED) {
        setupWebSocket(store);
      }
    }, 1000);
  }

  const { protocol, host } = window.location;
  const socketUrl = `${protocol === "https:" ? "wss" : "ws"}://${host}/socket`;
  socket = new WebSocket(socketUrl);
  /* FIXME: this reconnecting socket doesn't seem to... reconnect
  socket = new ReconnectingWebSocket(socketUrl, [], {
    connectionTimeout: 1000,
    minReconnectionDelay: 1000,
    maxReconnectionDelay: 3000,
    debug: true
  });
  */

  store.dispatch(setSocketConnecting());

  socket.addEventListener("open", event => {
    store.dispatch(setSocketConnected());
  });

  socket.addEventListener("close", event => {
    store.dispatch(setSocketDisconnected());
  });

  socket.addEventListener("message", event => {
    try {
      const data = JSON.parse(event.data);
      const name = data.event in socketEventHandlers ? data.event : "default";
      socketEventHandlers[name](store, { event, data });
    } catch (err) {
      console.log("socket message error", err, event);
    }
  });

  return socket;
}

const socketEventHandlers = {
  storeDispatch: (store, { data: { action } }) => {
    store.dispatch(action);
  },
  default: (store, { data }) => {
    console.log("unexpected socket message", data);
  }
};
