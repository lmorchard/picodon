import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore/* , combineReducers */ } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import { rootReducer, actions } from "./store";

import "./index.css";
import App from "./components/App";

let store;

function init() {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  store = setupStore();
  checkAuth();
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

function checkAuth() {
  fetch("/auth", { headers: { "Accept": "application/json" } })
    .then(res => Promise.all([ res.status, res.json() ]))
    .then(([ status, data ]) => {
      if (200 == status && data && data.user) {
        store.dispatch(actions.setUser(data.user));
      }
    })
    .catch(err => console.log("AUTH FAILURE", err));
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
