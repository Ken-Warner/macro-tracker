import express from "express";
import { createNewIngredient, deleteIngredient, getIngredients, } from "./ingredients.controller.js";
const ingredientsRouter = express.Router();
ingredientsRouter.get('/', getIngredients);
ingredientsRouter.delete('/:ingredientId', deleteIngredient);
ingredientsRouter.post('/', createNewIngredient);
export default ingredientsRouter;
//# sourceMappingURL=ingredients.router.js.map