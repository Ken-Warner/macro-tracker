const { query } = require('./pool');

async function getMeals(userid, date) {
  let queryObject = {
    text: `SELECT um.id AS user_meal_id, m.id AS meal_id,
          um.serving_size, um.meal_time,
          m.cal_per_serv, m.prot_per_serv, m.carbs_per_serv, m.fats_per_serv, m.name
          FROM user_meals AS um
          INNER JOIN meals AS m ON m.id = um.meal_id
          WHERE um.user_id = $1
          AND um.meal_time::date = $2;`,
    params: [
      userid,
      date,
    ],
  };

  const res = await query(queryObject);

  return res.rows;
}

async function getUserMeals(userid) {
  let queryObject = {
    text: `SELECT * FROM meals WHERE userid = $1 AND active = $2;`,
    params: [
      userid,
      true
    ],
  };

  const res = await query(queryObject);

  return res.rows;
}

async function deleteUserMeal(id, userid) {
  let queryObject = {
    text: `DELETE FROM user_meals WHERE id = $1 AND user_id = $2;`,
    params: [
      id,
      userid
    ],
  };

  const res = await query(queryObject);

  return res.rowCount;
}

async function addMeal(meal) {
  let queryObject = {
    text: `INSERT INTO user_meals (user_id, meal_id, meal_time, serving_size) 
          VALUES ($1, $2, $3, $4)
          RETURNING id;`,
    params: [
      meal.userid,
      meal.mealid,
      meal.mealTime,
      meal.servingSize,
    ],
  };

  const res = await query(queryObject);

  if (res.rowCount == 1)
    return res;
  else
    return { error: 'Failed to execute query.' };
}

async function deleteMeal(mealId) {
  let queryObject = {
    text: `UPDATE meals SET active = false WHERE id = $1;`,
    params: [
      mealId,
    ],
  };

  const res = await query(queryObject);
  
  if (res.rowCount == 1)
    return res;
  else
    return { error: 'Failed to execute query.' };
}

async function createMeal(meal) {
  let queryObject = {
    text: `INSERT INTO meals (userid, name, description, cal_per_serv, prot_per_serv, carbs_per_serv, fats_per_serv, active) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id;`,
    params: [
      meal.userid,
      meal.name,
      meal.description,
      meal.calPerServ,
      meal.protPerServ,
      meal.carbsPerServ,
      meal.fatsPerServ,
      meal.active,
    ],
  };

  const res = await query(queryObject);

  if (res.rowCount == 1)
    return { id: res.rows[0].id };
  else
    return { error: 'Failed to execute query' };
}

module.exports = {
  getMeals,
  getUserMeals,
  addMeal,
  deleteMeal,
  createMeal,
  deleteUserMeal,
};