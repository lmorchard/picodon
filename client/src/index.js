import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import { rootReducer, actions, selectors } from "../../lib/store";

import { refreshServerData } from "./data";
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
