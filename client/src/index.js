import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import ReconnectingWebSocket from "reconnecting-websocket";
import { fetchJson } from "./lib/utils";
import { rootReducer, actions, selectors } from "../../lib/store";

import "./index.less";
import App from "./components/App";

let store, socket;

function init() {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  store = setupStore();
  setupWebSocket();
  setupAuth();
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

function setupAuth() {
  store.dispatch(actions.setAuthLoading());
  fetch("/auth", { headers: { Accept: "application/json" } })
    .then(res => Promise.all([res.status, res.json()]))
    .then(([status, data]) => {
      if (200 == status && data && data.user) {
        store.dispatch(actions.setAuthUser(data.user));
        refreshServerData();
      }
    })
    .catch(err => console.log("AUTH FAILURE", err));
}

const socketSend = (event, data = {}) => {
  if (!socket) return;
  socket.send(JSON.stringify({ ...data, event }));
};

function setupWebSocket() {
  const {
    setSocketConnecting,
    setSocketConnected,
    setSocketDisconnected
  } = actions;

  const { protocol, host } = window.location;
  const socketUrl =
    `${protocol === "https:" ? "wss" : "ws"}://${host}/socket`;
  socket = new ReconnectingWebSocket(socketUrl, [], {
    connectionTimeout: 1000,
    maxRetries: 5
  });

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
      socketEventHandlers[name]({ event, data });
    } catch (err) {
      console.log("socket message error", err, event);
    }
  });
}

const socketEventHandlers = {
  storeDispatch: ({ data: { action } }) => {
    store.dispatch(action);
  },
  default: ({ data }) => {
    console.log("unexpected socket message", data);
  }
};

// TODO: switch over to websockets for this
function refreshServerData() {
  const state = store.getState();
  if (!selectors.isLoggedIn(state)) {
    setTimeout(refreshServerData, 10000);
    return;
  }

  const user = selectors.authUser(state);
  const actor = user.actor;

  Promise.all([
    fetchJson(actor.inbox + "?expand=1"),
    fetchJson(actor.outbox + "?expand=1")
  ])
    .then(([inboxData, outboxData, queueStatsData]) => {
      store.dispatch(actions.updateInbox(inboxData));
      store.dispatch(actions.updateOutbox(outboxData));
      setTimeout(refreshServerData, 10000);
    })
    .catch(err => {
      console.log("DATA FETCH FAILURE", err);
      setTimeout(refreshServerData, 10000);
    });
}

function renderApp() {
  render(
    <Provider store={store}>
      <App
        {...{
          socketSend
        }}
      />
    </Provider>,
    document.getElementById("root")
  );
}

init();
