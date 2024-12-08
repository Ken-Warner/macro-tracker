import { useState } from "react";
import Loader from "./Loader";
import ContainerItem from "./ContainerItem";

export default function Login({ onUserLogin, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);

  function handleSubmitCreateNewUser(e) {
    e.preventDefault();

    async function fetchCreateUser() {
      try {
        setIsLoading(true);
        onError("");
        const apiResult = await fetch("/api/users/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: e.target.elements.username.value,
            password: e.target.elements.password.value,
            passwordConfirm: e.target.elements.confirmPassword.value,
            emailAddress: e.target.elements.email.value,
          }),
        });
        const jsonResult = await apiResult.json();

        if (apiResult.ok) {
          onUserLogin(jsonResult);
        } else if (apiResult.status === 400) {
          onError(jsonResult.errorMessage);
        }
      } catch (e) {
        onError("An error occurred while attempting to create a user.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCreateUser();
  }

  function handleSubmitLogin(e) {
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
        onError("An error occurred while attempting to log in.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogin();
  }

  return (
    <>
      {isCreatingNewUser ? (
        <ContainerItem gridArea="login-form-container" itemHeader="Create User">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <form className="form" onSubmit={handleSubmitCreateNewUser}>
                <label for="username">Username</label>
                <input
                  name="username"
                  id="username"
                  className="input"
                  type="text"
                  pattern="^[a-zA-Z0-9_]{4,20}$"
                  title="Letters, numbers, dashes, and underscores up to 20 characters."
                  required
                />
                <label for="email">Email</label>
                <input
                  name="email"
                  id="email"
                  className="input"
                  type="email"
                  required
                />
                <label for="password">Password</label>
                <input
                  name="password"
                  id="password"
                  className="input"
                  type="password"
                  pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$"
                  title="At least 1 letter, 1 number, and 1 symbol (@$!%*#?&) between 8 and 20 characters"
                  required
                />
                <label for="confirmPassword">Confirm Password</label>
                <input
                  name="confirmPassword"
                  id="confirmPassword"
                  className="input"
                  type="password"
                  pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$"
                  title="At least 1 letter, 1 number, and 1 symbol (@$!%*#?&) between 8 and 20 characters"
                  required
                />
                <input
                  className="button submit"
                  type="submit"
                  value="Create User"
                />
              </form>
              <p>
                Already have an account?{" "}
                <span
                  className="link"
                  onClick={() => setIsCreatingNewUser(false)}
                >
                  Log In!
                </span>
              </p>
            </>
          )}
        </ContainerItem>
      ) : (
        <ContainerItem gridArea="login-form-container" itemHeader="Login">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <form className="form" onSubmit={handleSubmitLogin}>
                <label for="username">Username</label>
                <input
                  name="username"
                  id="username"
                  className="input"
                  type="text"
                  pattern="^[a-zA-Z0-9_]{4,20}$"
                  title="Letters, numbers, dashes, and underscores up to 20 characters."
                  required
                />
                <label for="password">Password</label>
                <input
                  name="password"
                  id="password"
                  className="input"
                  type="password"
                  pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$"
                  title="At least 1 letter, 1 number, and 1 symbol (@$!%*#?&) between 8 and 20 characters"
                  required
                />
                <input className="button submit" type="submit" value="Login" />
              </form>
              <p>
                Not tracking your macros?{" "}
                <span
                  className="link"
                  onClick={() => setIsCreatingNewUser(true)}
                >
                  Start Now!
                </span>
              </p>
            </>
          )}
        </ContainerItem>
      )}
    </>
  );
}
