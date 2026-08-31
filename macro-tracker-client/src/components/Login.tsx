import { useState, useEffect } from "react";
import ToastMessage, { type Toast } from "./reusables/ToastMessage";
import { postUserLogin } from "../utilities/api";
import { useUser } from "../context/useUser";
import LoginForm from "./LoginForm";
import CreateUserForm from "./CreateUserForm";
import PasswordRecoveryForm from "./PasswordRecoveryForm";

type FormType = "login" | "create-user" | "password-recovery";

export default function Login() {
  const { login } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [formType, setFormType] = useState<FormType>("login");

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

  function getFormComponent() {
    switch (formType) {
      case "create-user":
        return (
          <CreateUserForm
            key="create-user"
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            onError={(message) => setToast({ type: "error", message })}
            onSwitchToLogin={() => setFormType("login")}
          />
        );
      case "login":
        return (
          <LoginForm
            key="login"
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            onError={(message) => setToast({ type: "error", message })}
            onSwitchToCreate={() => setFormType("create-user")}
            onSwitchToPasswordRecovery={() => setFormType("password-recovery")}
          />
        );
      case "password-recovery":
        return (
          <PasswordRecoveryForm
            key="password-recovery"
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            onError={(message) => setToast({ type: "error", message })}
            onSwitchToLogin={() => setFormType("login")}
          />
        );
    }
  }

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      {getFormComponent()}
    </>
  );
}
