import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import { selectors, rootReducer, actions } from "./store";

import "./index.css";
import App from "./components/App";

let store;

function init() {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  store = setupStore();
  renderApp();
}

function setupStore() {
  const composeEnhancers = composeWithDevTools({});

  const initialState = {};

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(
        promiseMiddleware
      )
    )
  );
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