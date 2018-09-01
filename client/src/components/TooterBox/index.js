import React from "react";

import "./index.less";

import { ID_PUBLIC, dateNow, ObjectNote } from "../../../../lib/stamps";

export default class TooterBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: ""
    };
  }

  render() {
    return (
      <div className="tooterbox">
        <form onSubmit={this.handleSubmit}>
          <textarea
            name="content"
            value={this.state.content}
            onKeyPress={this.handleKeyPress}
            onChange={this.handleContentChange}
          />
          <input type="submit" value="Toot!" />
        </form>
      </div>
    );
  }

  handleContentChange = ev => {
    this.setState({ content: ev.target.value });
  };

  handleKeyPress = ev => {
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
    this.setState({ content: "" });

    const object = ObjectNote({
      to: [ID_PUBLIC],
      published: dateNow(),
      attributedTo: actor.id,
      content
    });

    const outboxUrl = actor.outbox;

    fetch(outboxUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object })
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
