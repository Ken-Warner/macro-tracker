import { useState, useEffect, type FormEvent } from "react";
import Loader from "./Loader";
import ToastMessage, { type Toast } from "./reusables/ToastMessage";
import ContainerItem from "./ContainerItem";
import { postCreateNewUser, postUserLogin } from "../utilities/api";
import { useUser } from "../context/useUser";

function getFormFieldValue(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement)) {
    throw new Error(`Missing form field: ${name}`);
  }
  return field.value;
}

function getCheckboxValue(form: HTMLFormElement, name: string): boolean {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement)) {
    return false;
  }
  return field.checked;
}

export default function Login() {
  const { login } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);
  const isToastDisplayed = toast != null;

  useEffect(() => {
    async function checkAuth() {
      try {
        login(await postUserLogin("", "", false));
      } catch {
        // No session cookie, login as normal
      } finally {
        setIsLoading(false);
      }
    }

    void checkAuth();
  }, [login]);

  function handleSubmitCreateNewUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    async function fetchCreateUser() {
      try {
        setIsLoading(true);

        login(
          await postCreateNewUser(
            getFormFieldValue(form, "username"),
            getFormFieldValue(form, "password"),
            getFormFieldValue(form, "confirmPassword"),
            getFormFieldValue(form, "email"),
          ),
        );
      } catch (error) {
        setToast({
          type: "error",
          message:
            error instanceof Error ? error.message : "Unable to create user",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void fetchCreateUser();
  }

  function handleSubmitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    async function fetchLogin() {
      try {
        setIsLoading(true);

        login(
          await postUserLogin(
            getFormFieldValue(form, "username"),
            getFormFieldValue(form, "password"),
            getCheckboxValue(form, "rememberMe"),
          ),
        );
      } catch (error) {
        setToast({
          type: "error",
          message: error instanceof Error ? error.message : "Unable to log in",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void fetchLogin();
  }

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      {isCreatingNewUser ? (
        <ContainerItem
          key="create-user"
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
        <ContainerItem
          key="login"
          gridArea="general-form-container"
          itemHeader="Login"
        >
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
                  autoFocus
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
