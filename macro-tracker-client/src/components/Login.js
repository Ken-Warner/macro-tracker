import { useState, useEffect } from "react";
import Loader from "./Loader";
import ToastMessage from "./reusables/ToastMessage";
import ContainerItem from "./ContainerItem";
import { postCreateNewUser, postUserLogin } from "../utilities/api";

export default function Login({ onUserLogin }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);

  const [toast, setToast] = useState(null);
  const isToastDisplayed = toast != null;

  useEffect(() => {
    async function checkAuth() {
      try {
        onUserLogin(await postUserLogin("", "", false));
      } catch {
        //TODO add some error handling here or something
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [onUserLogin]);

  function handleSubmitCreateNewUser(event) {
    event.preventDefault();

    async function fetchCreateUser() {
      try {
        setIsLoading(true);

        onUserLogin(
          await postCreateNewUser(
            event.target.elements.username.value,
            event.target.elements.password.value,
            event.target.elements.confirmPassword.value,
            event.target.elements.email.value,
          ),
        );
      } catch (error) {
        setToast({ type: "error", message: error.message });
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

        onUserLogin(
          await postUserLogin(
            event.target.elements.username.value,
            event.target.elements.password.value,
            event.target.elements.rememberMe.checked,
          ),
        );
      } catch (error) {
        setToast({ type: "error", message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogin();
  }

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      {isCreatingNewUser ? (
        <ContainerItem
          gridArea="general-form-container"
          itemHeader="Create User"
        >
          {isLoading ? (
            <Loader size={1.5} thickness={3} />
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
            <Loader size={1.5} thickness={3} />
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
                <div className="remember-me">
                  <label htmlFor="rememberMe">Remember Me:</label>
                  <input
                    name="rememberMe"
                    id="rememberMe"
                    type="checkbox"
                    value="true"
                  />
                </div>
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
