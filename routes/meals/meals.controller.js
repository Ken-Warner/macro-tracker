const {
  createMeal,
  createMealRaw,
  getMealsFromDay,
  getMealHistoryWithRange,
} = require('../../models/meals.model');

async function createNewMeal(req, res) {
  if (!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }
  res.status(200).send();
  return;
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

    //The pg module returns a Date object for dates, so it must be reformatted
    newMeal.date = newMeal.date.toISOString().split('T')[0];

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

  console.log(req.query.fromDate);
  console.log(req.query.toDate);

  try {

    const mealHistory = await getMealHistoryWithRange(req.session.userid,
                                                      req.query.fromDate,
                                                      req.query.toDate);

    console.log(mealHistory);
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

module.exports = {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals
};