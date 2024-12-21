const { query } = require("./pool");

async function selectMacrosFromDateRange(userId, fromDate, toDate) {
  let selectMacrosQuery = {
    text: `SELECT date, calories, protein, carbohydrates, fats
            FROM macro_totals
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3
            ORDER BY date DESC;`,
    params: [userId, fromDate, toDate],
  };

  const result = await query(selectMacrosQuery);

  return result.rows;
}

async function selectTodaysMacros(userId, today) {
  //tried desperately to figure out how to select with date equality but couldn't do it...
  //so doing this instead...
  let selectTodaysMacrosQuery = {
    text: `SELECT date,
                  calories,
                  protein,
                  carbohydrates,
                  fats
            FROM macro_totals
            WHERE user_id = $1
            ORDER BY date DESC
            LIMIT 1;`,
    params: [userId],
  };

  const queryResult = await query(selectTodaysMacrosQuery);

  if (queryResult.rowCount == 0) return {};
  else {
    const result = queryResult.rows[0];
    if (result.date.toISOString().split("T")[0] !== today) return {};
    else return result;
  }
}

module.exports = {
  selectMacrosFromDateRange,
  selectTodaysMacros,
};
