import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore /* , combineReducers */ } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import ReconnectingWebSocket from "reconnecting-websocket";
import { fetchJson } from "./lib/utils";
import { rootReducer, actions, selectors } from "./store";

import "./index.less";
import App from "./components/App";

let store, socket;

function init() {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  store = setupStore();
  setupSockets();
  checkAuth();
  renderApp();
}

function setupStore() {
  const composeEnhancers = composeWithDevTools({});

  const initialState = {};

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(promiseMiddleware))
  );
}

function checkAuth() {
  fetch("/auth", { headers: { Accept: "application/json" } })
    .then(res => Promise.all([res.status, res.json()]))
    .then(([status, data]) => {
      if (200 == status && data && data.user) {
        store.dispatch(actions.setUser(data.user));
        refreshServerData();
      }
    })
    .catch(err => console.log("AUTH FAILURE", err));
}

function setupSockets() {
  const { protocol, host } = window.location;
  const socketUrl = `${protocol === "https:" ? "wss" : "ws"}://${host}/socket`;

  socket = new ReconnectingWebSocket(socketUrl);

  socket.addEventListener("open", event => {
    console.log("SOCKET OPEN");
  });

  socket.addEventListener("close", event => {
    console.log("SOCKET CLOSE");
  });

  socket.addEventListener("message", event => {
    console.log("SOCKET MESSAGE", event.data);
  });

  setInterval(() => {
    console.log("pong!");
    socket.send(
      JSON.stringify({
        event: "pong"
      })
    );
  }, 2000);
}

// TODO: switch over to websockets for this
function refreshServerData() {
  const state = store.getState();
  if (!selectors.isLoggedIn(state)) {
    setTimeout(refreshServerData, 5000);
    return;
  }

  const user = selectors.authUser(state);
  const actor = user.actor;

  Promise.all([
    fetchJson(actor.inbox + "?expand=1"),
    fetchJson(actor.outbox + "?expand=1"),
    fetchJson("/queues")
  ])
    .then(([inboxData, outboxData, queueStatsData]) => {
      store.dispatch(actions.updateInbox(inboxData));
      store.dispatch(actions.updateOutbox(outboxData));
      store.dispatch(actions.updateQueueStats(queueStatsData));
      setTimeout(refreshServerData, 5000);
    })
    .catch(err => {
      console.log("DATA FETCH FAILURE", err);
      setTimeout(refreshServerData, 5000);
    });
}

function renderApp() {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("root")
  );
}

init();
