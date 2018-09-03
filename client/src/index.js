import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
// import ReconnectingWebSocket from "reconnecting-websocket";
import { fetchJson } from "./lib/utils";
import { rootReducer, actions, selectors } from "../../lib/store";

import { setupAuth } from "./auth";
import { setupWebSocket, socketSend } from "./sockets";

import "./index.less";
import App from "./components/App";

function init() {
  const store = setupStore();
  setupAuth(store, () => {
    setupWebSocket(store);
    refreshServerData(store);
  });
  renderApp(store);
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

// TODO: switch over to websockets for this?
function refreshServerData(store) {
  const state = store.getState();
  if (!selectors.isLoggedIn(state)) {
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
    })
    .catch(err => {
      console.log("DATA FETCH FAILURE", err);
    });
}

function renderApp(store) {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  render(
    <Provider store={store}>
      <App
        {...{
          socketSend,
          refreshServerData: () => refreshServerData(store),
          setupWebSocket: () => setupWebSocket(store)
        }}
      />
    </Provider>,
    root
  );
}

init();
