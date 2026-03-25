import express from "express";
import usersRouter from "./users/users.router.js";
import ingredientsRouter from "./ingredients/ingredients.router.js";
import mealsRouter from "./meals/meals.router.js";
import weighInRouter from "./weighIn/weighIn.router.js";
import macrosRouter from "./macros/macros.router.js";

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/ingredients', ingredientsRouter);
apiRouter.use('/meals', mealsRouter);
apiRouter.use('/weighIn', weighInRouter);
apiRouter.use('/macros', macrosRouter);

export default apiRouter;