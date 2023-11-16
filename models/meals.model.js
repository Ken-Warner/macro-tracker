const { 
  query,
  buildInsert,
  DEFAULT,
 } = require('./pool');

async function createMeal(userid, meal) {

  // throw new Error('not yet implemented');

  console.log(meal);

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

  console.log(getIngredientsQuery);
  let ingredientResult;

  try {
    ingredientsResult = await query(getIngredientsQuery);
    console.log(ingredientsResult);
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

    newMeal.calories += (ingredient.calories * portionSize);
    newMeal.protein += (ingredient.protein * portionSize);
    newMeal.carbohydrates += (ingredient.carbohydrates * portionSize);
    newMeal.fats += (ingredient.fats * portionSize);
  });

  console.log(newMeal);

  return await createMealRaw(userid, newMeal);
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
      return result.rows[0];
    } else {
      throw new Error('Unale to create new meal');
    }
  } catch (e) {
    console.log(e);
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

async function getMealHistoryWithRange(userid, fromDate, toDate) {
  let getMealHistoryQuery = {
    text: `SELECT *
            FROM meals
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3;`,
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

module.exports = {
  createMeal,
  createMealRaw,
  getMealsFromDay,
  getMealHistoryWithRange,
};