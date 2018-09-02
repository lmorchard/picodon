const { combineReducers } = require("redux");
const {
  createActions,
  combineActions,
  handleActions
} = require("redux-actions");

const actions = createActions(
  {
    setSocketDisconnected: () => "disconnected",
    setSocketConnecting: () => "connecting",
    setSocketConnected: () => "connected",
    setAuthLoading: () => "loading",
    setAuthLoaded: () => "loaded",
    setAuthFailed: () => "failed"
  },
  "setAuthUser",
  "clearAuthUser",
  "updateInbox",
  "pushInbox",
  "updateOutbox",
  "pushOutbox",
  "updateQueueStats"
);

const selectors = {
  socketStatus: state => state.ui.socketStatus,
  socketConnected: state => state.ui.socketStatus === "connected",
  authLoading: state => state.ui.authStatus === "loading",
  authFailed: state => state.ui.authStatus === "failed",
  authUser: state => state.ui.authUser,
  isLoggedIn: state => !!state.ui.authUser,
  queueStats: state => state.ui.queueStats,
  inboxActivities: state => state.activities.inbox,
  outboxActivities: state => state.activities.outbox
};

const rootReducer = combineReducers({
  ui: handleActions(
    {
      [combineActions(
        actions.setSocketConnected,
        actions.setSocketConnecting,
        actions.setSocketDisconnected
      )]: (state, { payload: socketStatus }) => ({
        ...state,
        socketStatus
      }),
      [combineActions(
        actions.setAuthLoading,
        actions.setAuthLoaded,
        actions.setAuthFailed
      )]: (state, { payload: authStatus }) => ({
        ...state,
        authStatus
      }),
      [actions.setAuthUser]: (state, { payload: authUser }) => ({
        ...state,
        authUser,
        authStatus: "loaded"
      }),
      [actions.clearAuthUser]: state => ({
        ...state,
        authUser: false,
        authStatus: "loaded"
      }),
      [actions.updateQueueStats]: (state, { payload: queueStats = {} }) => ({
        ...state,
        queueStats
      })
    },
    {
      socketStatus: "disconnected",
      authStatus: "loading",
      authUser: null,
      queueStats: {}
    }
  ),
  activities: handleActions(
    {
      [actions.updateInbox]: (state, { payload: collection = {} }) => ({
        ...state,
        inbox: collection.orderedItems || []
      }),
      [actions.pushInbox]: (state, { payload: object }) => ({
        ...state,
        inbox: [object, ...state.inbox]
      }),
      [actions.updateOutbox]: (state, { payload: collection = {} }) => ({
        ...state,
        outbox: collection.orderedItems || []
      }),
      [actions.pushOutbox]: (state, { payload: object }) => ({
        ...state,
        outbox: [object, ...state.outbox]
      })
    },
    {
      inbox: [],
      outbox: []
    }
  )
});

const mapActionsToDispatchProps = dispatch =>
  Object.entries(actions).reduce(
    (acc, [name, action]) => ({
      ...acc,
      [name]: (...args) => dispatch(action(...args))
    }),
    {}
  );

const mapSelectorsToStateProps = state =>
  Object.entries(selectors).reduce(
    (acc, [name, selector]) => ({
      ...acc,
      [name]: () => selector(state)
    }),
    {}
  );

module.exports = {
  actions,
  selectors,
  rootReducer,
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
};
