import React from "react";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
import classNames from "classnames";
import {
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
} from "../../../../lib/store";
import {
  ActivityFollow
} from "../../../../lib/stamps";
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
    <span className="indicator">&#x23FA;</span> {socketStatus}
  </div>
);

class FollowBox extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      submitting: false
    };
  }
  
  handleSubmit = ev => {
    ev.preventDefault();
    
    const authUser = this.props.authUser();
    if (!authUser) { return; }
    const actor = authUser.actor;
  
    const formEl = this.formRef.current;
    const formData = new FormData(formEl);
    
    const activity = ActivityFollow({
      actor: actor.id,
      object: formData.get("followId").toString()
    });
    console.log("ACTIVITY", activity);
    
    fetch(actor.outbox, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity)
    })
      .then(res => Promise.all([res.status, res.json()]))
      .then(([status, data]) => {
        this.setState({ submitting: false });
      })
      .catch(err => {
        this.setState({ submitting: false });
      });
    
    formEl.reset();
    console.log("followId", formData.get("followId"));
  };
  
  render() {
    return (
      <form ref={this.formRef} onSubmit={this.handleSubmit}>
        <input
          name="followId"
          type="text"
          placeholder="id"
        />
        <input
          type="submit"
          value={this.state.submitting ? "Following..." : "Follow"}
          disabled={this.state.submitting}
        />
      </form>
    );
  }
}

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
      <React.Fragment>
        <div className="tooterface">
          <div>
            <h2>Outbox</h2>
            <FollowBox {...props} />
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
      </React.Fragment>
    )}
  </div>
);

export default hot(module)(
  connect(
    mapSelectorsToStateProps,
    mapActionsToDispatchProps
  )(AppComponent)
);
