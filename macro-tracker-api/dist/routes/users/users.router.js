import express from "express";
import { createNewUser, logUserIn, logUserOut } from "./users.controller.js";
const usersRouter = express.Router();
usersRouter.post('/create', createNewUser);
usersRouter.post('/login', logUserIn);
usersRouter.get('/logout', logUserOut);
export default usersRouter;
//# sourceMappingURL=users.router.js.map