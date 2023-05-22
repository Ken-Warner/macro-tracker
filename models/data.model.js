const { query } = require('./pool');

async function getDataForDateRange(userId, fromDate, toDate) {
  let queryObject = {
    text: `SELECT m.name AS "mealName", 
                  um.meal_time AS "mealTime", 
                  m.cal_per_serv AS "calsPerServ", 
                  m.prot_per_serv AS "protPerServ", 
                  m.carbs_per_serv AS "carbsPerServ", 
                  m.fats_per_serv AS "fatsPerServ", 
                  um.serving_size AS "servingSize" 
           FROM user_meals AS um 
           INNER JOIN meals AS m 
             ON um.meal_id = m.id 
           WHERE um.user_id = $1 
             AND um.meal_time::date BETWEEN $2 AND $3;`,
    params: [
      userId,
      fromDate,
      toDate,
    ]
  };

  const result = await query(queryObject);

  return result;
}

module.exports = {
  getDataForDateRange,
};