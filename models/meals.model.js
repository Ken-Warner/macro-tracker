const { 
  query,
  buildInsert,
  DEFAULT,
 } = require('./pool');

async function createMeal(userid, meal) {

  let getIngredientsQuery = {
    text: `SELECT id, calories, protein, carbohydrates, fats
            FROM ingredients
            WHERE user_id = $1
              AND id IN (${meal.ingredients.map((ingredient, idx) => '$' + (idx + 2)).join(',')});`,
    params: [
      userid,
      ...meal.ingredients.map(ingredient => ingredient.ingredientId)
    ]
  };

  let ingredientResult;
  let mealRecipe = new Array();

  try {
    ingredientsResult = await query(getIngredientsQuery);

    //a recipe needs to be added for this ingredient stack

    if (ingredientsResult.rowCount <= 0)
      throw new Error();

  } catch (e) {
    throw new Error('Unable to select the provided ingredients');
  }

  let newMeal = {
    name: meal.name,
    description: meal.description,
    date: meal.date,
    time: meal.time,
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0
  };

  ingredientsResult.rows.forEach(ingredient => {
    const portionSize = meal.ingredients.find(el => el.ingredientId == ingredient.id).portionSize;

    const recipeAssociation = {
      ingredientId: ingredient.id,
      portionSize: portionSize
    };

    mealRecipe.push(recipeAssociation);

    newMeal.calories += (ingredient.calories * portionSize);
    newMeal.protein += (ingredient.protein * portionSize);
    newMeal.carbohydrates += (ingredient.carbohydrates * portionSize);
    newMeal.fats += (ingredient.fats * portionSize);
  });

  const finalNewMeal = await createMealRaw(userid, newMeal);

  mealRecipe.forEach(component => component.mealId = finalNewMeal.id);
  await insertMealRecipe(mealRecipe);

  return finalNewMeal;
}

async function createMealRaw(userid, meal) {

  let fields = [
    'user_id',
    'name',
    'description',
    'date',
    'time',
    'calories',
    'protein',
    'carbohydrates',
    'fats'
  ];

  let values = [
    userid,
    meal.name,
    meal.description,
    meal.date || DEFAULT,
    meal.time || DEFAULT,
    meal.calories,
    meal.protein,
    meal.carbohydrates,
    meal.fats
  ];

  [ queryFields, queryValues, queryParams ] = buildInsert(fields, values);

  let createMealQuery = {
    text: `INSERT INTO meals ${queryFields}
            VALUES ${queryValues}
            RETURNING *;`,
    params: queryParams,
  }

  try {
    const result = await query(createMealQuery);

    if (result.rowCount == 1) {

      let resultMeal = result.rows[0];

      //pg returns a date object instead of an ISO string, so it must be converted
      //to get the YYYY-MM-DD part of the date
      resultMeal.date = resultMeal.date.toISOString().split('T')[0];
      //same with the time string
      resultMeal.time = resultMeal.time.split('.')[0];

      await updateMacroTotals(userid, resultMeal);

      return resultMeal;
    } else {
      throw new Error('Unale to create new meal');
    }
  } catch (e) {
    throw new Error('Invalid query to create new meal');
  }
}

async function getMealsFromDay(userid, daysAgo) {
  let getMealsQuery = {
    text: `SELECT *
            FROM meals
            WHERE user_id = $1
            AND (current_date - date) = $2;`,
    params: [
      userid,
      daysAgo
    ]
  };

  try {
    const result = await query(getMealsQuery);
    return result.rows;
  } catch (e) {
    throw new Error('Invalid Query');
  }
}

async function deleteMeal(userid, mealId) {
  let deleteMealQuery = {
    text: `DELETE FROM meals
            WHERE user_id = $1
              AND id = $2
            RETURNING *;`,
    params: [
      userid,
      mealId
    ]
  };

  const result = await query(deleteMealQuery);

  if (result.rowCount == 1) {
    let deletedMeal = result.rows[0];

    //update macro totals but with negative macros
    deletedMeal.calories *= -1;
    deletedMeal.protein *= -1;
    deletedMeal.carbohydrates *= -1;
    deletedMeal.fats *= -1;
    deletedMeal.date = deletedMeal.date.toISOString().split('T')[0];

    await updateMacroTotals(userid, deletedMeal);
  }
}

async function getMealHistoryWithRange(userid, fromDate, toDate) {
  let getMealHistoryQuery = {
    text: `SELECT *
            FROM meals
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3
            ORDER BY date DESC;`,
    params: [
      userid,
      fromDate,
      toDate
    ]
  };

  try {
    const result = await query(getMealHistoryQuery);

    return result.rows;
  } catch (e) {
    throw new Error('Unable to perform query');
  }
}

async function insertMealRecipe(mealRecipe) {
  let mealRecipeQuery = {
    text: `INSERT INTO meal_ingredients (meal_id, ingredient_id, portion_size)
            VALUES ${mealRecipe.map((el, idx) => {
              const firstIdx = (3 * idx) + 1;
              return `($${firstIdx},$${firstIdx + 1},$${firstIdx +2 })`
            }).join(',')};`,
    params: mealRecipe.map(el=> [el.mealId, el.ingredientId, el.portionSize]).flat(),
  };

  return await query(mealRecipeQuery);
}

async function updateMacroTotals(userid, meal) {
  //I'm sure there is some sort of UPSERT method you can use on postgresql
  //that will do this all on the database side, this is a temporary implementation
  //until I research how to do that.

  //get current macro totals
  let getMacroTotalsQuery = {
    text: `SELECT date, calories, protein, carbohydrates, fats
            FROM macro_totals
            WHERE user_id = $1
              AND date = $2;`,
    params: [
      userid,
      meal.date
    ]
  };

  let result = await query(getMacroTotalsQuery);

  let upsertQuery = {
    text: ``,
    params: []
  };

  //if they exist
  if (result.rowCount == 1) {
    let macroTotals = result.rows[0];

    macroTotals.calories += meal.calories;
    macroTotals.protein += meal.protein;
    macroTotals.carbohydrates += meal.carbohydrates;
    macroTotals.fats += meal.fats;

    upsertQuery = {
      text: `UPDATE macro_totals
              SET (calories, protein, carbohydrates, fats)
                = ($1, $2, $3, $4)
              WHERE user_id = $5
                AND date = $6;`,
      params: [
        macroTotals.calories,
        macroTotals.protein,
        macroTotals.carbohydrates,
        macroTotals.fats,
        userid,
        macroTotals.date.toISOString().split('T')[0]
      ]
    };
  //if they don't
  } else {
    upsertQuery = {
      text: `INSERT INTO macro_totals (user_id, date, calories, protein, carbohydrates, fats)
              VALUES ($1, $2, $3, $4, $5, $6);`,
      params: [
        userid,
        meal.date,
        meal.calories,
        meal.protein,
        meal.carbohydrates,
        meal.fats
      ]
    };
  }

  await query(upsertQuery);
}

module.exports = {
  createMeal,
  createMealRaw,
  getMealsFromDay,
  getMealHistoryWithRange,
  deleteMeal
};