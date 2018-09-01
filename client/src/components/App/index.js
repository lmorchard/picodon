import React from "react";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
// import classnames from "classnames";
import sanitizeHtml from "sanitize-html";
import SanitizedHTML from "react-sanitized-html";
import {
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
} from "../../store";

import "./index.less";

import AuthState from "../AuthState";
import TooterBox from "../TooterBox";

export const AppComponent = props => (
  <div>
    <AuthState {...props} />

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

const noteAllowedTags = sanitizeHtml.defaults.allowedTags.concat(["span"]);

const noteAllowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  span: ["class"],
  a: ["href", "class"]
};

const Note = ({ actor, object: { id, url, content, published } }) => (
  <li className="note h-entry">
    <div className="p-author h-card">
      <a
        className="p-name u-url"
        target="_blank"
        rel="noopener noreferrer"
        href={actor}
      >
        {actor}
      </a>
    </div>
    <a href={url || id} target="_blank" rel="noopener noreferrer">
      <date dateTime={published}>{published}</date>
    </a>
    <div className="e-content">
      <SanitizedHTML
        allowedTags={noteAllowedTags}
        allowedAttributes={noteAllowedAttributes}
        html={content}
      />
    </div>
  </li>
);

export default hot(module)(
  connect(
    mapSelectorsToStateProps,
    mapActionsToDispatchProps
  )(AppComponent)
);
