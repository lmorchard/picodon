const { combineReducers } = require("redux");
const {
  createActions,
  handleActions /* , combineActions */
} = require("redux-actions");

const actions = createActions({}, "setUser", "clearUser");

const selectors = {
  isLoggedIn: state => !!state.auth.user,
  authUser: state => state.auth.user
};

const rootReducer = combineReducers({
  auth: handleActions(
    {
      [actions.setUser]: (state, { payload: user }) => ({ ...state, user }),
      [actions.clearUser]: state => ({ ...state, user: null })
    },
    { user: null }
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
