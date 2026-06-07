import { createContext } from "react";
import { User } from "@macro-tracker/macro-tracker-shared";

export type UserContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
};

export const UserContext = createContext<UserContextValue | null>(null);
