const {
  createMeal,
  createMealRaw,
  getMealsFromDay,
  getMealHistoryWithRange,
  deleteMeal,
} = require('../../models/meals.model');

const validator = require('../../Utilities/validator');

const {
  log,
  loggingLevels,
  formatResponse
} = require('../../Utilities/logger');

async function createNewMeal(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  let meal = req.body;

  if (!meal.name) {
    res.status(400).send(JSON.stringify({ error: 'You must provide a meal name' }));
    return;
  }
  if (!meal.ingredients || meal.ingredients.length < 1) {
    res.status(400).send(JSON.stringify({ error: 'You must provide at least one ingredient' }));
    return;
  }
  if (!meal.ingredients || meal.ingredients.some(ingredient => ingredient.ingredientId <= 0)) {
    res.status(400).send(JSON.stringify({ error: '1 or more of the ingredient IDs is invalid' }));
    return;
  }
  if (!meal.ingredients || meal.ingredients.some(ingredient => ingredient.portionSize <= 0)) {
    res.status(400).send(JSON.stringify({ error: '1 or more of the ingredients portion sizes are invalid' }));
    return;
  }

  try {
    let newMeal = await createMeal(req.session.userId, meal);

    res.status(201).send(JSON.stringify(newMeal));
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `createNewMeal: ${e.message}`,
                            req.body);
    res.status(500).send(formatResponse(uuid));
  }
}

async function createNewMealRaw(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    if (!req.body.name) {
      res.status(400).send(JSON.stringify({ error: `You must provide a meal name.` }));
      return;
    }

    let newMeal = {
      name: req.body.name,
      description: req.body.description,
      calories: req.body.calories || 0,
      protein: req.body.protein || 0,
      carbohydrates: req.body.carbohydrates || 0,
      fats: req.body.fats || 0,
      date: req.body.date,
      time: req.body.time,
    };

    newMeal = await createMealRaw(req.session.userId, newMeal);

    res.status(201).send(JSON.stringify(newMeal));
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `createNewMealRaw: ${e.message}`,
                            req.body);
    res.status(500).send(formatResponse(uuid));
  }
}

async function getMealHistory(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  if (!validator.isValidDate(req.query.fromDate) || !validator.isValidDate(req.query.toDate)) {
    res.status(400).send(JSON.stringify({ error: 'You must provide a date range with values fromDate and toDate in the format YYYY-MM-DD' }));
    return;
  }

  try {
    const mealHistory = await getMealHistoryWithRange(req.session.userId,
                                                      req.query.fromDate,
                                                      req.query.toDate);

    res.status(200).send(JSON.stringify(mealHistory));
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `getMealHistory: ${e.message}`,
                            req.query);
    res.status(500).send(formatResponse(uuid));
  }
}

async function getMeals(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  const daysAgo = req.query.daysAgo || 0;

  if (!validator.isNumberGEZero(daysAgo)) {
    res.status(400).send(JSON.stringify({ error: 'You must provide a numerical offset, day greater than 0, from today as daysAgo' }));
    return;
  }

  try {
    const meals = await getMealsFromDay(req.session.userid, daysAgo);

    res.status(200).send(JSON.stringify(meals));
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `getMeals: ${e.message}`,
                            req.query);
    res.status(500).send(formatResponse(uuid));
  }
}

async function deleteMealById(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  if (!validator.isNumberGEZero(req.params.id)) {
    res.status(400).send(JSON.stringify({ error: `A numeric meal ID must be provided.` }));
    return;
  }

  try {
    await deleteMeal(req.session.userId, req.params.id);

    res.status(200).send();
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `deleteMealById: ${e.message}`,
                            { userId: req.session.userId, requestParamaters: req.params });
    res.status(500).send(formatResponse(uuid));
  }
}

module.exports = {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals,
  deleteMealById
};