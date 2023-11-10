const {
  createMeal,
  createMealRaw,
  getMealsAfterAge,
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
  res.status(200).send();
  return;

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
  console.log(req.query);
  res.status(200).send();
  return;
}

module.exports = {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals
};