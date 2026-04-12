import express from "express";
import {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals,
  deleteMealById,
  putMealIsRecurring,
} from "./meals.controller.js";

const mealsRouter = express.Router();

mealsRouter.post("/nonComposed", createNewMealRaw);
mealsRouter.get("/history", getMealHistory);
mealsRouter.post("/", createNewMeal);
mealsRouter.delete("/:id", deleteMealById);
mealsRouter.get("/", getMeals);
mealsRouter.put("/:id", putMealIsRecurring);

export default mealsRouter;
