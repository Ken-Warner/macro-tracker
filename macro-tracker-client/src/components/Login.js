import { useState } from "react";
import Loader from "./Loader";
import ContainerItem from "./ContainerItem";
import { postCreateNewUser, postUserLogin } from "../utilities/api";

export default function Login({ onUserLogin, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);

  function handleSubmitCreateNewUser(event) {
    event.preventDefault();

    async function fetchCreateUser() {
      try {
        setIsLoading(true);
        onError("");
        onUserLogin(
          await postCreateNewUser(
            event.target.elements.username.value,
            event.target.elements.password.value,
            event.target.elements.confirmPassword.value,
            event.target.elements.email.value,
          ),
        );
      } catch (error) {
        onError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreateUser();
  }

  function handleSubmitLogin(event) {
    event.preventDefault();

    async function fetchLogin() {
      try {
        setIsLoading(true);
        onError("");

        onUserLogin(
          await postUserLogin(
            event.target.elements.username.value,
            event.target.elements.password.value,
          ),
        );
      } catch (error) {
        onError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogin();
  }

  return (
    <>
      {isCreatingNewUser ? (
        <ContainerItem
          gridArea="general-form-container"
          itemHeader="Create User"
        >
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <form className="form" onSubmit={handleSubmitCreateNewUser}>
                <label htmlFor="username">Username</label>
                <input
                  name="username"
                  id="username"
                  className="input"
                  type="text"
                  pattern="^[a-zA-Z0-9_]{4,20}$"
                  title="Letters, numbers, dashes, and underscores up to 20 characters."
                  required
                />
                <label htmlFor="email">Email</label>
                <input
                  name="email"
                  id="email"
                  className="input"
                  type="email"
                  required
                />
                <label htmlFor="password">Password</label>
                <input
                  name="password"
                  id="password"
                  className="input"
                  type="password"
                  pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$"
                  title="At least 1 letter, 1 number, and 1 symbol (@$!%*#?&) between 8 and 20 characters"
                  required
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
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
        <ContainerItem gridArea="general-form-container" itemHeader="Login">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <form className="form" onSubmit={handleSubmitLogin}>
                <label htmlFor="username">Username</label>
                <input
                  name="username"
                  id="username"
                  className="input"
                  type="text"
                  pattern="^[a-zA-Z0-9_]{4,20}$"
                  title="Letters, numbers, dashes, and underscores up to 20 characters."
                  required
                  focus="true"
                />
                <label htmlFor="password">Password</label>
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
