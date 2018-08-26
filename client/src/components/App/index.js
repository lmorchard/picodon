import React from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
import { /* actions, */ selectors } from "../../store";

import "./index.css";

export const AppComponent = props => (
  <div>
    <h1>Hello from this app</h1>
  </div>
);

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = state => {
  const mappedSelectors = Object.entries(selectors).reduce(
    (acc, [name, selector]) => ({ ...acc, [name]: selector(state) }),
    {}
  );
  return {
    ...mappedSelectors
  };
};

export default hot(module)(connect(
  mapStateToProps,
  mapDispatchToProps
)(AppComponent));