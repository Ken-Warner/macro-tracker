import { type FormEvent } from "react";
import ContainerItem from "./ContainerItem";
import { getPasswordRecovery } from "../utilities/api";
import { getFormFieldValue } from "./authFormFields";
import Loader from "./Loader";

export default function PasswordRecoveryForm({
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
  function handleSubmitPasswordRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    async function fetchPasswordRecovery() {
      try {
        onLoadingChange(true);
        const apiResult = await getPasswordRecovery(
          getFormFieldValue(form, "username"),
        );

        if (apiResult.ok) {
          console.log("Password recovery email sent");
        } else {
          onError(apiResult.errorMessage);
        }
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "Unable to reset password",
        );
      } finally {
        onLoadingChange(false);
      }
    }

    void fetchPasswordRecovery();
  }

  return (
    <ContainerItem
      gridArea="general-form-container"
      itemHeader="Reset Password"
    >
      {isLoading ? (
        <Loader size={1.5} thickness={3} />
      ) : (
        <>
          <form className="form" onSubmit={handleSubmitPasswordRecovery}>
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
            <input
              className="button submit"
              type="submit"
              value="Reset Password"
            />
          </form>
          <p>
            Back to login?{" "}
            <span className="link" onClick={onSwitchToLogin}>
              Login!
            </span>
          </p>
        </>
      )}
    </ContainerItem>
  );
}
