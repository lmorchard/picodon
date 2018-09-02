import React from "react";

import "./index.less";

export default class AuthState extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  render() {
    const { isLoggedIn, authUser, authLoading } = this.props;

    if (authLoading()) {
      return <div className="authState loading">Loading...</div>;
    }
    if (isLoggedIn()) {
      return (
        <div className="authState loggedIn">
          Logged in as: {authUser().displayName} -{" "}
          <button onClick={this.handleLogout}>Logout</button>
        </div>
      );
    }
    return (
      <div className="authState loggedOut">
        <form
          ref={this.formRef}
          action="/auth/login"
          method="post"
          onSubmit={this.handleLogin}
        >
          <div>
            <label>Username:</label>
            <input type="text" name="username" />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" name="password" />
          </div>
          <div>
            <input type="submit" value="Log In" />
          </div>
        </form>
      </div>
    );
  }

  handleLogin = ev => {
    const { setAuthUser, clearAuthUser } = this.props;

    const loginFormData = new FormData(this.formRef.current);
    const loginData = ["username", "password"].reduce(
      (acc, name) => ({ ...acc, [name]: loginFormData.get(name) }),
      {}
    );

    fetch("/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    })
      .then(res => Promise.all([res.status, res.json()]))
      .then(([status, data]) => {
        if (200 == status) {
          setAuthUser(data.user);
        } else {
          clearAuthUser();
        }
      })
      .catch(err => {
        console.log("LOGIN FAILURE", err);
      });

    ev.preventDefault();
  };

  handleLogout = ev => {
    const { clearAuthUser } = this.props;

    fetch("/auth/logout", { method: "POST" })
      .then(res => Promise.all([res.status, res.json()]))
      .then(([status, data]) => {
        if (200 == status) {
          clearAuthUser();
        }
      })
      .catch(err => {
        console.log("LOGOUT FAILURE", err);
      });
  };
}
