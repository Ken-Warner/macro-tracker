const express = require('express');

const {
  getMealsForDate,
  getMealsForUser,
  createNewMealForUser,
  addNewMealForDate,
  httpCreateNewMeal,
  httpCreateNewSingleMeal,
  removeMealFromDailyMealList,
  createNewSingleMeal,
  softDeleteMeal,
} = require('./meals.controller');

//TODO
//turn login auth back on
// - In .hbs file uncomment pattners/required parameters
// - In auth.controller reset req.body for login forms

//NEEDS ERROR HANDLING

//UX IDEAS
// - add gestures (swipe, long touch, ...) to delete functionality for user meals
// - add "remember me" checkbox to login screen
// - central auth?

//UI IDEAS
// - add meal click sound
// - add meal card active color change

//FUNCTIONAL CHANGES
// - refactor code to decouple UI from backend

const mealsRouter = new express.Router();

mealsRouter.get('/meals', getMealsForUser);
mealsRouter.get('/mealsForDate/:date', getMealsForDate);
mealsRouter.post('/mealForDate', addNewMealForDate);
mealsRouter.get('/createNewMeal', httpCreateNewMeal);
mealsRouter.get('/createSingleMeal', httpCreateNewSingleMeal);
mealsRouter.post('/meal', createNewMealForUser);
mealsRouter.post('/singleMeal', createNewSingleMeal);
mealsRouter.delete('/deleteListEntry/:id', removeMealFromDailyMealList);
//this function is not implemented in the frontend
//the intent is to use gestures for this
mealsRouter.delete('/deleteMeal/:id', softDeleteMeal);

mealsRouter.get('/*', (req, res) => {
  res.redirect('/');
});

module.exports = mealsRouter;