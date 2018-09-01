import React from "react";

import "./index.less";

export default class AuthState extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  render() {
    const { isLoggedIn, authUser } = this.props;

    return isLoggedIn() ? (
      <div>
        Logged in as: {authUser().displayName} -{" "}
        <button onClick={this.handleLogout}>Logout</button>
      </div>
    ) : (
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
    );
  }

  handleLogin = ev => {
    const { setUser, clearUser } = this.props;

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
      .then(res => Promise.all([res.status, res.json()]))
      .then(([status, data]) => {
        if (200 == status) {
          clearUser();
        }
      })
      .catch(err => {
        console.log("LOGOUT FAILURE", err);
      });
  };
}
