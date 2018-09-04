import { actions, selectors } from "../../lib/store";
import { fetchJson } from "./lib/utils";

// TODO: switch over to websockets for this?
export function refreshServerData(store) {
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
