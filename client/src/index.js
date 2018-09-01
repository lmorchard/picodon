import React from "react";
import { render } from "react-dom";
import { applyMiddleware, createStore /* , combineReducers */ } from "redux";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import { rootReducer, actions, selectors } from "./store";

import "./index.less";
import App from "./components/App";

let store;

function init() {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  store = setupStore();
  checkAuth();
  setInterval(checkActivities, 1000);
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
      }
    })
    .catch(err => console.log("AUTH FAILURE", err));
}

const fetchJson = url =>
  fetch(url, {
    headers: {
      Accept:
        'application/ld+json; profile="https://www.w3.org/ns/activitystreams", application/json'
    }
  }).then(r => r.json());

function checkActivities() {
  const state = store.getState();
  if (!selectors.isLoggedIn(state)) {
    return;
  }

  const user = selectors.authUser(state);
  const actor = user.actor;

  fetchJson(actor.inbox)
    .then(data => store.dispatch(actions.updateInbox(data)))
    .catch(err => console.log("INBOX FAILURE", err));

  fetchJson(actor.outbox)
    .then(data => store.dispatch(actions.updateOutbox(data)))
    .catch(err => console.log("OUTBOX FAILURE", err));
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
