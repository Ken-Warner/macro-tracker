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
  console.log(req.query);
  res.status(200).send();
  return;
}

async function getMeals(req, res) {
  if (!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  const daysAgo = req.query.daysAgo || 0;

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