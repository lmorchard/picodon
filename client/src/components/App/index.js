import React from "react";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
// import classnames from "classnames";
import {
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
} from "../../store";
import { ID_PUBLIC, DateNow, ObjectNote } from "../../../../lib/stamps";

import "./index.less";

export const AppComponent = (props) => (
  <div>
    <AuthState {...props} />
    <h1>Hello from Picodon!</h1>
    {props.isLoggedIn() && (
      <div>
        <TooterBox {...props} />
      </div>
    )}
  </div>
);

class TooterBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: ""
    };
  }
  
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <textarea name="content" 
          value={this.state.content}
          onChange={this.handleContentChange}></textarea>
        <input type="submit" value="Toot!" />
      </form>
    );
  }

  handleContentChange = ev => {
    this.setState({ content: ev.target.value });
  };
  
  handleSubmit = ev => {
    ev.preventDefault();
    
    const actor = this.props.authUser().actor;

    const content = this.state.content;
    this.setState({ content: "" });
    
    const object = ObjectNote({
      to: [ ID_PUBLIC ],
      published: DateNow(),
      attributedTo: actor.id,
      content
    });
    
    const outboxUrl = actor.outbox;
    
    fetch(outboxUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object })
    })
    .then(res => Promise.all([ res.status, res.json() ]))
    .then(([ status, data ]) => {
      console.log("TOOT SUBMITTED!", status);
    })
    .catch(err => {
      console.log("TOOT FAILURE!");
    });
  }
}

class AuthState extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }
  
  render() {
    const { isLoggedIn, authUser } = this.props;
    
    return (  
      isLoggedIn() ? (
        <div>
          <p>Logged in as: {authUser().displayName}</p>
          <button onClick={this.handleLogout}>Logout</button>
        </div>
      ) : (
        <form ref={this.formRef} action="/auth/login" method="post" onSubmit={this.handleLogin}>
          <div>
              <label>Username:</label>
              <input type="text" name="username" />
          </div>
          <div>
              <label>Password:</label>
              <input type="password" name="password" />
          </div>
          <div>
              <input type="submit" value="Log In"/>
          </div>
        </form>
      )
    );
  }
  
  handleLogin = ev => {
    const { setUser, clearUser } = this.props;
    
    const loginFormData = new FormData(this.formRef.current);
    const loginData = [ "username", "password" ].reduce(
      (acc, name) => ({ ...acc, [name]: loginFormData.get(name) }),
      {}
    );

    fetch("/auth/login", {
      method: "POST", 
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    })
      .then(res => Promise.all([ res.status, res.json() ]))
      .then(([ status, data ]) => {
        if (200 == status) {
          setUser(data.user);          
        } else {
          clearUser();
        }
      })
      .catch(err => {
        console.log("LOGIN FAILURE", err);
      });

    ev.preventDefault();
  };

  handleLogout = ev => {
    const { clearUser } = this.props;
    
    fetch("/auth/logout", { method: "POST" })
      .then(res => Promise.all([ res.status, res.json() ]))
      .then(([ status, data ]) => {
        if (200 == status) {
          clearUser();
        }
      })
      .catch(err => {
        console.log("LOGOUT FAILURE", err);
      });
  }
}

export default hot(module)(connect(
  mapSelectorsToStateProps,
  mapActionsToDispatchProps
)(AppComponent));
