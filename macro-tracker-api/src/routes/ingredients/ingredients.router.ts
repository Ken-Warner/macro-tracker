import express from "express";
import {
  createNewIngredient,
  deleteIngredient,
  getIngredients,
  getIngredientFromImage,
} from "./ingredients.controller.js";
import { parseIngredientImageUpload } from "../../Utilities/ingredientImage.js";

const ingredientsRouter = express.Router();

ingredientsRouter.get("/", getIngredients);
ingredientsRouter.delete("/:ingredientId", deleteIngredient);
ingredientsRouter.post("/", createNewIngredient);
ingredientsRouter.post(
  "/fromImage",
  parseIngredientImageUpload,
  getIngredientFromImage,
);

export default ingredientsRouter;
