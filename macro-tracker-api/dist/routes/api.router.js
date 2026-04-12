import express from "express";
import usersRouter from "./users/users.router.js";
import ingredientsRouter from "./ingredients/ingredients.router.js";
import mealsRouter from "./meals/meals.router.js";
import weighInRouter from "./weighIn/weighIn.router.js";
import macrosRouter from "./macros/macros.router.js";
const apiRouter = express.Router();
function requireSession(req, res, next) {
    if (!req.session || !req.session.userId || !req.session.username) {
        return res.status(401).send();
    }
    next();
}
apiRouter.use("/users", usersRouter);
apiRouter.use("/ingredients", requireSession, ingredientsRouter);
apiRouter.use("/meals", requireSession, mealsRouter);
apiRouter.use("/weighIn", requireSession, weighInRouter);
apiRouter.use("/macros", requireSession, macrosRouter);
export default apiRouter;
//# sourceMappingURL=api.router.js.map