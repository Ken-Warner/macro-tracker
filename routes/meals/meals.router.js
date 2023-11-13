const express = require('express');

const {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals
} = require('./meals.controller');

const mealsRouter = express.Router();

mealsRouter.post('/nonComposed', createNewMealRaw);
mealsRouter.get('/history', getMealHistory)
mealsRouter.post('/', createNewMeal);
mealsRouter.get('/', getMeals);

mealsRouter.all('/*', (req, res, next) => {
  res.status(404).send();
  return;
});

module.exports = mealsRouter;