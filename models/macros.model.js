const {
  query
} = require('./pool');

async function selectMacrosFromDateRange(userId, fromDate, toDate) {
  let selectMacrosQuery = {
    text: `SELECT date, calories, protein, carbohydrates, fats
            FROM macro_totals
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3
            ORDER BY date DESC;`,
    params: [
      userId,
      fromDate,
      toDate
    ]
  };

  const result = await query(selectMacrosQuery);

  return result.rows;
}

module.exports = {
  selectMacrosFromDateRange
};