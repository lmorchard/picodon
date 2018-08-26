const { combineReducers } = require("redux");
const {
  createActions,
  handleActions,
  combineActions
} = require("redux-actions");

const actions = createActions(
  {
  },
  "setPlay"
);

const selectors = {
  
};

const rootReducer = combineReducers({
  play: handleActions (
    {
      [actions.setPlay]: (state, { payload }) => ({ ...state, play: payload })
    },
    { play: true }
  )
});

module.exports = {
  actions,
  selectors,
  rootReducer
};