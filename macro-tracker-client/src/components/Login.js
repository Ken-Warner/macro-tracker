import { useState } from "react";

export default function Login({ onUserLogin, onError }) {
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    async function fetchLogin() {
      try {
        setIsLoading(true);
        onError("");
        const apiResult = await fetch("/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: e.target.elements.username.value,
            password: e.target.elements.password.value,
          }),
        });
        const jsonResult = await apiResult.json();

        if (apiResult.ok) {
          onUserLogin(jsonResult);
        } else if (apiResult.status === 400) {
          onError(jsonResult.errorMessage);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogin();
  }

  //add loading component if isLoading = true
  return (
    <div className="container">
      <div className="container-item login-form-container">
        <div className="container-item-header">Login</div>
        <div className="container-item-body">
          <form className="form" onSubmit={handleSubmit}>
            <label for="username">Username</label>
            <input
              name="username"
              id="username"
              className="input"
              type="text"
              required
            />
            <label for="password">Password</label>
            <input
              name="password"
              id="password"
              className="input"
              type="password"
              required
            />
            <input className="button submit" type="submit" value="Login" />
          </form>
          <p>
            Not tracking your macros? <a href="#">Start Now!</a>
          </p>
        </div>
      </div>
    </div>
  );
}
