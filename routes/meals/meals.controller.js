const {
  createMeal,
  createMealRaw,
  getMealsFromDay,
  getMealHistoryWithRange,
  deleteMeal,
  updateMealIsRecurring,
  selectRecurringMeals,
  insertMealsFromRecurringUpdate,
} = require("../../models/meals.model");

const validator = require("../../Utilities/validator");

const {
  log,
  loggingLevels,
  formatResponse,
} = require("../../Utilities/logger");

async function createNewMeal(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  let meal = req.body;

  if (!meal.name) {
    res
      .status(400)
      .send(JSON.stringify({ error: "You must provide a meal name" }));
    return;
  }
  if (!meal.ingredients || meal.ingredients.length < 1) {
    res
      .status(400)
      .send(
        JSON.stringify({ error: "You must provide at least one ingredient" })
      );
    return;
  }
  if (
    !meal.ingredients ||
    meal.ingredients.some((ingredient) => ingredient.ingredientId <= 0)
  ) {
    res
      .status(400)
      .send(
        JSON.stringify({ error: "1 or more of the ingredient IDs is invalid" })
      );
    return;
  }
  if (
    !meal.ingredients ||
    meal.ingredients.some((ingredient) => ingredient.portionSize <= 0)
  ) {
    res.status(400).send(
      JSON.stringify({
        error: "1 or more of the ingredients portion sizes are invalid",
      })
    );
    return;
  }

  try {
    let newMeal = await createMeal(req.session.userId, meal);

    res.status(201).send(JSON.stringify(newMeal));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `createNewMeal: ${e.message}`,
      req.body
    );
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
      res
        .status(400)
        .send(JSON.stringify({ error: `You must provide a meal name.` }));
      return;
    }

    let newMeal = {
      name: req.body.name,
      description: req.body.description,
      calories: (req.body.calories || -1) < 0 ? 0 : req.body.calories,
      protein: (req.body.protein || -1) < 0 ? 0 : req.body.protein,
      carbohydrates:
        (req.body.carbohydrates || -1) < 0 ? 0 : req.body.carbohydrates,
      fats: (req.body.fats || -1) < 0 ? 0 : req.body.fats,
      date: req.body.date,
      time: req.body.time,
    };

    newMeal = await createMealRaw(req.session.userId, newMeal);

    const responseMeal = {
      id: newMeal.id,
      name: newMeal.name,
      description: newMeal.description,
      calories: newMeal.calories,
      protein: newMeal.protein,
      carbohydrates: newMeal.carbohydrates,
      fats: newMeal.fats,
      date: newMeal.date,
      time: newMeal.time,
    };

    res.status(201).send(JSON.stringify(responseMeal));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `createNewMealRaw: ${e.message}`,
      req.body
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function getMealHistory(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  if (
    !validator.isValidDate(req.query.fromDate) ||
    !validator.isValidDate(req.query.toDate)
  ) {
    res.status(400).send(
      JSON.stringify({
        error:
          "You must provide a date range with values fromDate and toDate in the format YYYY-MM-DD",
      })
    );
    return;
  }

  try {
    const mealHistoryWithoutRecurring = await getMealHistoryWithRange(
      req.session.userId,
      req.query.fromDate,
      req.query.toDate
    );

    let newMeals = [];
    let newMacroTotals = [];

    if (
      (mealHistoryWithoutRecurring.length > 0 &&
        mealHistoryWithoutRecurring[0].date.toISOString().split("T")[0] !==
          req.query.toDate) ||
      mealHistoryWithoutRecurring.length === 0
    ) {
      const recurringMeals = await selectRecurringMeals(req.session.userId);
      if (recurringMeals.length > 0) {
        const recurringMacroTotals = recurringMeals.reduce(
          (acc, curr) => {
            acc.calories += curr.calories;
            acc.protein += curr.protein;
            acc.carbohydrates += curr.carbohydrates;
            acc.fats += curr.fats;

            return acc;
          },
          {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fats: 0,
          }
        );

        const toDate = new Date(req.query.toDate + "T00:00:00");
        let currentDate = new Date(recurringMeals[0].date);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate <= toDate) {
          newMeals.push(
            ...recurringMeals.map((recurringMeal) => {
              return {
                ...recurringMeal,
                date: new Date(currentDate),
                userId: req.session.userId,
                isRecurring: true,
              };
            })
          );
          newMacroTotals.push({
            ...recurringMacroTotals,
            date: new Date(currentDate),
            userId: req.session.userId,
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        await insertMealsFromRecurringUpdate(newMeals, newMacroTotals);
      }
    }

    const mealHistory = [...newMeals.reverse(), ...mealHistoryWithoutRecurring];

    let deepMealHistory = [];
    for (let meal of mealHistory) {
      meal.date = meal.date.toISOString().split("T")[0];

      let deepMealHistoryDate = deepMealHistory.find(
        (el) => el.mealsDate === meal.date
      );

      if (!deepMealHistoryDate) {
        deepMealHistoryDate = {
          mealsDate: meal.date,
          meals: [meal],
        };
        deepMealHistory.push(deepMealHistoryDate);
      } else {
        deepMealHistoryDate.meals.push(meal);
      }
    }

    res.status(200).send(JSON.stringify(deepMealHistory));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `getMealHistory: ${e.message}`,
      req.query
    );
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
    res.status(400).send(
      JSON.stringify({
        error:
          "You must provide a numerical offset, day greater than 0, from today as daysAgo",
      })
    );
    return;
  }

  try {
    const meals = await getMealsFromDay(req.session.userid, daysAgo);

    res.status(200).send(JSON.stringify(meals));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `getMeals: ${e.message}`,
      req.query
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function deleteMealById(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  if (!validator.isNumberGEZero(req.params.id)) {
    res
      .status(400)
      .send(JSON.stringify({ error: `A numeric meal ID must be provided.` }));
    return;
  }

  try {
    await deleteMeal(req.session.userId, req.params.id);

    res.status(200).send();
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `deleteMealById: ${e.message}`,
      { userId: req.session.userId, requestParamaters: req.params }
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function putMealIsRecurring(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    const result = await updateMealIsRecurring(
      req.params.id,
      req.session.userId,
      req.body.isRecurring
    );

    res.status(result === 1 ? 200 : 404).send();
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `putMealIsRecurring: ${e.message}`,
      { userId: req.session.userId, requestParamaters: req.params }
    );
    res.status(500).send(formatResponse(uuid));
  }
}

module.exports = {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals,
  deleteMealById,
  putMealIsRecurring,
};
