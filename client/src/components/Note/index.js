import React from "react";
import sanitizeHtml from "sanitize-html";
import SanitizedHTML from "react-sanitized-html";
import formatDistance from "date-fns/formatDistance";

import "./index.less";

export const Note = ({
  to,
  cc,
  actor,
  object: { id, url, content, published }
}) => (
  <li className="note h-entry">
    <div className="p-author h-card">
      <a
        className="p-name u-url"
        target="_blank"
        rel="noopener noreferrer"
        href={actorLink(actor)}
      >
        {actorDisplayName(actor)}
      </a>
    </div>
    <a href={url || id} target="_blank" rel="noopener noreferrer">
      <time title={published} dateTime={published}>
        {humaneAge(published)}
      </time>
    </a>
    <div className="e-content">
      <SanitizedHTML
        allowedTags={noteAllowedTags}
        allowedAttributes={noteAllowedAttributes}
        html={content}
      />
    </div>
    {to && <div className="to">to: {JSON.stringify(to)}</div>}
    {cc && <div className="cc">cc: {JSON.stringify(cc)}</div>}
  </li>
);

const actorLink = actor => actor.url || actor.id;

const actorDisplayName = actor =>
  actor.name || actor.preferredUsername || actor.id;

const noteAllowedTags = sanitizeHtml.defaults.allowedTags.concat(["span"]);

const noteAllowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  span: ["class"],
  a: ["href", "class"]
};

const humaneAge = date => `${formatDistance(Date.parse(date), new Date())} ago`;

export default Note;
