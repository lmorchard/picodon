import React from "react";

import "./index.less";

import {
  ID_PUBLIC,
  dateNow,
  ActivityCreate,
  ObjectNote
} from "../../../../lib/stamps";

export default class TooterBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.defaultState();
  }

  defaultState = () => ({
    to: ID_PUBLIC,
    cc: "",
    content: ""
  });

  resetState = () => this.setState(this.defaultState());

  render() {
    return (
      <div className="tooterbox">
        <form onSubmit={this.handleSubmit}>
          <textarea
            name="content"
            value={this.state.content}
            onKeyPress={this.handleContentKeyPress}
            onChange={this.handleContentChange}
          />
          <input
            type="text"
            placeholder="to"
            value={this.state.to}
            onChange={this.handleToChange}
          />
          <input
            type="text"
            placeholder="cc"
            value={this.state.cc}
            onChange={this.handleCcChange}
          />
          <input type="submit" value="Toot!" />
        </form>
      </div>
    );
  }

  handleToChange = ev => this.setState({ to: ev.target.value });

  handleCcChange = ev => this.setState({ cc: ev.target.value });

  handleContentChange = ev => this.setState({ content: ev.target.value });

  handleContentKeyPress = ev => {
    // Submit on ctrl-enter
    if (ev.ctrlKey && ev.charCode === 13) {
      this.handleSubmit(ev);
    }
  };

  handleSubmit = ev => {
    ev.preventDefault();

    const authUser = this.props.authUser();
    if (!authUser) {
      return;
    }

    const actor = authUser.actor;

    const content = `<p>${this.state.content}</p>`;
    this.resetState();

    const activity = ActivityCreate({
      object: ObjectNote({
        published: dateNow(),
        attributedTo: actor.id,
        content
      })
    });

    if (this.state.to) {
      activity.to = activity.object.to = this.state.to.split(/[,;] ?/);
    }

    if (this.state.cc) {
      activity.cc = activity.object.cc = this.state.cc.split(/[,;] ?/);
    }

    console.log("ACTIVITY", activity);

    const outboxUrl = actor.outbox;
    fetch(outboxUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity)
    })
      .then(res => Promise.all([res.status, res.json()]))
      .then(([status, data]) => {
        console.log("TOOT SUBMITTED!", status);
      })
      .catch(err => {
        console.log("TOOT FAILURE!");
      });
  };
}
