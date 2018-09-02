import React from "react";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
import {
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
} from "../../store";

import "./index.less";

import AuthState from "../AuthState";
import TooterBox from "../TooterBox";
import Note from "../Note";

export const AppComponent = props => (
  <div>
    <AuthState {...props} />
    <span>{JSON.stringify(props.queueStats())}</span>

    {props.isLoggedIn() && (
      <div className="tooterface">
        <div>
          <h2>Outbox</h2>
          <TooterBox {...props} />
          <ul className="outbox notes">
            {props.outboxActivities().map((activity, idx) => (
              <Note key={idx} {...activity} />
            ))}
          </ul>
        </div>

        <div>
          <h2>Inbox</h2>
          <ul className="inbox notes">
            {props.inboxActivities().map((activity, idx) => (
              <Note key={idx} {...activity} />
            ))}
          </ul>
        </div>
      </div>
    )}
  </div>
);

export default hot(module)(
  connect(
    mapSelectorsToStateProps,
    mapActionsToDispatchProps
  )(AppComponent)
);
