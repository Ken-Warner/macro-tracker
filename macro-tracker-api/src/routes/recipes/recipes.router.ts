import express from "express";
import {
  createNewRecipe,
  deleteRecipe,
  getRecipes,
  patchRecipeById,
  resetRecipeById,
} from "./recipes.controller.js";

const recipesRouter = express.Router();

recipesRouter.get("/", getRecipes);
recipesRouter.post("/", createNewRecipe);
recipesRouter.patch("/:recipeId", patchRecipeById);
recipesRouter.post("/:recipeId/reset", resetRecipeById);
recipesRouter.delete("/:recipeId", deleteRecipe);

export default recipesRouter;
