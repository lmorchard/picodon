import React from "react";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
import classNames from "classnames";
import {
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
} from "../../../../lib/store";

import "./index.less";

import AuthState from "../AuthState";
import TooterBox from "../TooterBox";
import Note from "../Note";

const QueueStats = ({ queueStats }) => (
  <ul className="queueStats">
    {Object.entries(queueStats).map(([name, stats], idx) => (
      <li key={idx}>
        {stats.isPaused ? "◫" : "►"} {stats.size}/{stats.pending} {name}
      </li>
    ))}
  </ul>
);

const SocketStatus = ({ socketStatus }) => (
  <div className={classNames("socketStatus", socketStatus)}>
    <span className="indicator">&#x23FA;</span> { socketStatus }
  </div>
);

export const AppComponent = props => (
  <div className="app">
    <header>
      <AuthState {...props} />
      {props.isLoggedIn() && (
        <React.Fragment>
          <button onClick={props.refreshServerData}>Refresh data</button>
          <button onClick={props.setupWebSocket}>Reconnect</button>
          <SocketStatus socketStatus={props.socketStatus()} />
          <QueueStats queueStats={props.queueStats()} />
        </React.Fragment>
      )}
    </header>

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
