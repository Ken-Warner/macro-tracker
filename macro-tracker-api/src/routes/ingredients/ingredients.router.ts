import express from "express";
import {
  createNewIngredient,
  deleteIngredient,
  getIngredients,
  getIngredientFromImage,
} from "./ingredients.controller.js";
import { parseIngredientImageUpload } from "../../Utilities/ingredientImage.js";
import { isIngredientOcrEnabled } from "../../Utilities/featureFlags.js";
import type { NextFunction, Request, Response } from "express";

const ingredientsRouter = express.Router();

function requireIngredientOcr(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!isIngredientOcrEnabled()) {
    res
      .status(403)
      .send(JSON.stringify({ error: "Ingredient OCR is disabled." }));
    return;
  }
  next();
}

ingredientsRouter.get("/", getIngredients);
ingredientsRouter.delete("/:ingredientId", deleteIngredient);
ingredientsRouter.post("/", createNewIngredient);
ingredientsRouter.post(
  "/fromImage",
  requireIngredientOcr,
  parseIngredientImageUpload,
  getIngredientFromImage,
);

export default ingredientsRouter;
