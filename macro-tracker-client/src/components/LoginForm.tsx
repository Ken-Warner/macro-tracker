import { type FormEvent } from "react";
import Loader from "./Loader";
import ContainerItem from "./ContainerItem";
import { postUserLogin } from "../utilities/api";
import { useUser } from "../context/useUser";
import { getCheckboxValue, getFormFieldValue } from "./authFormFields";

export default function LoginForm({
  isLoading,
  onLoadingChange,
  onError,
  onSwitchToCreate,
  onSwitchToPasswordRecovery,
}: {
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onError: (message: string) => void;
  onSwitchToCreate: () => void;
  onSwitchToPasswordRecovery: () => void;
}) {
  const { login } = useUser();

  function handleSubmitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    async function fetchLogin() {
      try {
        onLoadingChange(true);

        login(
          await postUserLogin(
            getFormFieldValue(form, "username"),
            getFormFieldValue(form, "password"),
            getCheckboxValue(form, "rememberMe"),
          ),
        );
      } catch (error) {
        onError(error instanceof Error ? error.message : "Unable to log in");
      } finally {
        onLoadingChange(false);
      }
    }

    void fetchLogin();
  }

  return (
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
            Forgot your password?{" "}
            <span className="link" onClick={onSwitchToPasswordRecovery}>
              Reset it!
            </span>
          </p>
          <br />
          <p>
            Not tracking your macros?{" "}
            <span className="link" onClick={onSwitchToCreate}>
              Start Now!
            </span>
          </p>
        </>
      )}
    </ContainerItem>
  );
}
