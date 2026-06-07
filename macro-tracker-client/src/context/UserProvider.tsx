import { useCallback, useMemo, useState, type ReactNode } from "react";
import { User } from "@macro-tracker/macro-tracker-shared";
import { getUserLogout } from "../utilities/api";
import { UserContext } from "./userContext";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    void getUserLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: user !== null,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
