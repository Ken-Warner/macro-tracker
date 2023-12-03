const {
  createMeal,
  createMealRaw,
  getMealsFromDay,
  getMealHistoryWithRange,
  deleteMeal,
} = require('../../models/meals.model');

async function createNewMeal(req, res) {
  if (!req.session.userid || !req.session.username) {
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

    let newMeal = await createMeal(req.session.userid, meal);

    res.status(201).send(JSON.stringify(newMeal));

  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `An error has occurred: ${e.message}` }));
    return;
  }
}

async function createNewMealRaw(req, res) {
  if (!req.session.userid || !req.session.username) {
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

    console.log(newMeal);

    newMeal = await createMealRaw(req.session.userid, newMeal);

    res.status(201).send(JSON.stringify(newMeal));
    return;

  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `An error occurred: ${e.message}` }));
    return;
  }
}

async function getMealHistory(req, res) {
  if (!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  const dateRegex = /\d{4}-\d{2}-\d{2}/;

  if (!dateRegex.test(req.query.fromDate) || !dateRegex.test(req.query.toDate)) {
    res.status(400).send(JSON.stringify({ error: 'You must provide a date range with values fromDate and toDate in the format YYYY-MM-DD' }));
    return;
  }

  try {

    const mealHistory = await getMealHistoryWithRange(req.session.userid,
                                                      req.query.fromDate,
                                                      req.query.toDate);

    res.status(200).send(JSON.stringify(mealHistory));
    return;
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `An error occurred: ${e.message}` }));
  }
}

async function getMeals(req, res) {
  if (!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  const daysAgo = req.query.daysAgo || 0;
  const validationRegex = /\d+/;
  if (!validationRegex.test(daysAgo) || daysAgo < 0) {
    res.status(400).send(JSON.stringify({ error: 'You must provide a numerical offset, day greater than 0, from today as daysAgo' }));
    return;
  }

  try {
    const meals = await getMealsFromDay(req.session.userid, daysAgo);

    res.status(200).send(JSON.stringify(meals));
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `An error occured: ${e.message}` }))
  }
}

async function deleteMealById(req, res) {
  if (!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    await deleteMeal(req.session.userid, req.params.id);

    res.status(200).send();

  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `An Error occurred: ${e.message}` }));
  }
}

module.exports = {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals,
  deleteMealById
};