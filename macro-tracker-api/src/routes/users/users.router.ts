import express from "express";
import {
  createNewUser,
  logUserIn,
  logUserOut,
  postVerificationToken,
  setPasswordRecovery,
} from "./users.controller.js";

const usersRouter = express.Router();

usersRouter.post("/create", createNewUser);
usersRouter.post("/login", logUserIn);
usersRouter.get("/logout", logUserOut);
usersRouter.get("/passwordRecovery/:username", setPasswordRecovery);
usersRouter.post(
  "/passwordRecovery/:username/verificationToken",
  postVerificationToken,
);

export default usersRouter;
