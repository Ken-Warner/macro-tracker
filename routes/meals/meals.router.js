const express = require("express");

const {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals,
  deleteMealById,
  putMealIsRecurring,
} = require("./meals.controller");

const mealsRouter = express.Router();

mealsRouter.post("/nonComposed", createNewMealRaw);
mealsRouter.get("/history", getMealHistory);
mealsRouter.post("/", createNewMeal);
mealsRouter.delete("/:id", deleteMealById);
mealsRouter.get("/", getMeals);
mealsRouter.put("/:id", putMealIsRecurring);

module.exports = mealsRouter;
