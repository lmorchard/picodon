import React from "react";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
// import classnames from "classnames";
import {
  mapActionsToDispatchProps,
  mapSelectorsToStateProps
} from "../../store";

import "./index.css";

export const AppComponent = (props) => (
  <div>
    <h1>Hello from Picodon, how are you?</h1>
    <AuthState {...props} />
  </div>
);

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
}

export default hot(module)(connect(
  mapSelectorsToStateProps,
  mapActionsToDispatchProps
)(AppComponent));
