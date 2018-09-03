import { actions, selectors } from "../../lib/store";

let currentIsLoggedIn = false;

export function setupAuth(store, onLoginChange) {
  store.subscribe(() => {
    let previousIsLoggedIn = currentIsLoggedIn;
    currentIsLoggedIn = selectors.isLoggedIn(store.getState());
    if (currentIsLoggedIn === previousIsLoggedIn) {
      return;
    }
    onLoginChange();
  });

  store.dispatch(actions.setAuthLoading());

  fetch("/auth", { headers: { Accept: "application/json" } })
    .then(res => Promise.all([res.status, res.json()]))
    .then(([status, data]) =>
      store.dispatch(
        200 == status && data && data.user
          ? actions.setAuthUser(data.user)
          : actions.clearAuthUser()
      )
    )
    .catch(err => {
      store.dispatch(actions.setAuthFailed());
      console.log("AUTH FAILURE", err);
    });
}
