const { 
  query,
  buildInsert,
  DEFAULT,
 } = require('./pool');

async function createMeal(userid, meal) {

  throw new Error('not yet implemented');

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