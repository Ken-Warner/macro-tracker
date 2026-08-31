import { type FormEvent } from "react";
import Loader from "./Loader";
import ContainerItem from "./ContainerItem";
import { postCreateNewUser } from "../utilities/api";
import { useUser } from "../context/useUser";
import { getFormFieldValue } from "./authFormFields";

export default function CreateUserForm({
  isLoading,
  onLoadingChange,
  onError,
  onSwitchToLogin,
}: {
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onError: (message: string) => void;
  onSwitchToLogin: () => void;
}) {
  const { login } = useUser();

  function handleSubmitCreateNewUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    async function fetchCreateUser() {
      try {
        onLoadingChange(true);

        login(
          await postCreateNewUser(
            getFormFieldValue(form, "username"),
            getFormFieldValue(form, "password"),
            getFormFieldValue(form, "confirmPassword"),
            getFormFieldValue(form, "email"),
          ),
        );
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "Unable to create user",
        );
      } finally {
        onLoadingChange(false);
      }
    }

    void fetchCreateUser();
  }

  return (
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
            <span className="link" onClick={onSwitchToLogin}>
              Log In!
            </span>
          </p>
        </>
      )}
    </ContainerItem>
  );
}
