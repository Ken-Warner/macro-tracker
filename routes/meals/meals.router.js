const express = require('express');

const {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals,
  deleteMealById,
} = require('./meals.controller');

const mealsRouter = express.Router();

mealsRouter.post('/nonComposed', createNewMealRaw);
mealsRouter.get('/history', getMealHistory)
mealsRouter.post('/', createNewMeal);
mealsRouter.delete('/:id', deleteMealById);
mealsRouter.get('/', getMeals);

module.exports = mealsRouter;