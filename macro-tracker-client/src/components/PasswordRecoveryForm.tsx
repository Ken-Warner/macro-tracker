import { useState, type FormEvent } from "react";
import ContainerItem from "./ContainerItem";
import {
  getPasswordRecovery,
  postNewPassword,
  postVerificationToken,
} from "../utilities/api";
import { getFormFieldValue } from "./authFormFields";
import Loader from "./Loader";

type PasswordRecoveryFormState =
  | "username"
  | "verificationCode"
  | "newPassword";

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
  const [formStep, setFormStep] =
    useState<PasswordRecoveryFormState>("username");
  const [verificationUuid, setVerificationUuid] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  function handleSubmitUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    async function fetchPasswordRecovery() {
      try {
        onLoadingChange(true);
        const username = getFormFieldValue(form, "username");
        const apiResult = await getPasswordRecovery(username);

        if (apiResult.ok) {
          setFormStep("verificationCode");
          setUsername(username);
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

  function handleSubmitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    async function fetchVerificationToken() {
      try {
        onLoadingChange(true);
        const verificationToken = getFormFieldValue(form, "verificationToken");
        const apiResult = await postVerificationToken(
          username,
          verificationToken,
        );
        if (apiResult.ok) {
          setVerificationUuid(apiResult.body.verificationUuid);
          setFormStep("newPassword");
        } else {
          onError(apiResult.errorMessage);
        }
      } catch (error) {
        onError(
          error instanceof Error
            ? error.message
            : "Unable to verify verification token",
        );
      } finally {
        onLoadingChange(false);
      }
    }

    void fetchVerificationToken();
  }

  function handleSubmitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    const newPassword = getFormFieldValue(form, "newPassword");
    const confirmNewPassword = getFormFieldValue(form, "confirmNewPassword");
    if (newPassword !== confirmNewPassword) {
      onError("New passwords do not match");
      return;
    }

    async function fetchNewPassword() {
      try {
        onLoadingChange(true);

        const apiResult = await postNewPassword(
          username,
          verificationUuid,
          newPassword,
          confirmNewPassword,
        );

        if (apiResult.ok) {
          onSwitchToLogin();
        } else {
          onError(apiResult.errorMessage);
        }
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "Unable to set new password",
        );
      } finally {
        onLoadingChange(false);
      }
    }

    void fetchNewPassword();
  }

  const usernameForm = (
    <>
      <form className="form" onSubmit={handleSubmitUsername}>
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
        <input className="button submit" type="submit" value="Reset Password" />
      </form>
    </>
  );

  const codeForm = (
    <>
      <form className="form" onSubmit={handleSubmitCode}>
        <label htmlFor="verificationToken">Verification Token</label>
        <input
          name="verificationToken"
          id="verificationToken"
          className="input"
          type="text"
          pattern="^[0-9]{6}$"
          title="6 digits"
          required
        />
        <input className="button submit" type="submit" value="Verify" />
      </form>
    </>
  );
  const newPasswordForm = (
    <>
      <form className="form" onSubmit={handleSubmitNewPassword}>
        <label htmlFor="newPassword">New Password</label>
        <input
          name="newPassword"
          id="newPassword"
          className="input"
          type="password"
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
          title="At least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
          required
        />
        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input
          name="confirmNewPassword"
          id="confirmNewPassword"
          className="input"
          type="password"
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
          title="At least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
          required
        />
        <input className="button submit" type="submit" value="Reset Password" />
      </form>
    </>
  );

  return (
    <ContainerItem
      gridArea="general-form-container"
      itemHeader="Reset Password"
    >
      {isLoading ? (
        <Loader size={1.5} thickness={3} />
      ) : (
        <>
          {formStep === "username" && usernameForm}
          {formStep === "verificationCode" && codeForm}
          {formStep === "newPassword" && newPasswordForm}
        </>
      )}
      <p>
        Back to login?{" "}
        <span className="link" onClick={onSwitchToLogin}>
          Login!
        </span>
      </p>
    </ContainerItem>
  );
}
