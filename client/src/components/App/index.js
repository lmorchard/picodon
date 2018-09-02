import React from "react";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
import {
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
} from "../../../../lib/store";

import "./index.less";

import AuthState from "../AuthState";
import TooterBox from "../TooterBox";
import Note from "../Note";

const QueueStats = ({ queueStats }) => (
  <span className="queueStats">{JSON.stringify(queueStats)}</span>
);

export const AppComponent = props => (
  <div>
    <AuthState {...props} />

    {props.isLoggedIn() && (
      <div>
        <button onClick={props.refreshServerData}>Refresh data</button>
        <QueueStats queueStats={props.queueStats()} />
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
