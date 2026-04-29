import { MacroData } from "@macro-tracker/macro-tracker-shared";
import { query } from "./pool.js";

export async function selectMacrosFromDateRange(
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<MacroData[]> {
  const selectMacrosQuery = {
    text: `SELECT date, calories, protein, carbohydrates, fats
            FROM macro_totals
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3
            ORDER BY date DESC;`,
    params: [userId, fromDate, toDate],
  };

  const result = await query(selectMacrosQuery);

  return result.rows.map(
    (row) =>
      new MacroData(
        row.date.toISOString().split("T")[0],
        row.calories,
        row.protein,
        row.carbohydrates,
        row.fats,
      ),
  );
}

export async function selectTodaysMacros(
  userId: string,
  today: string | undefined,
): Promise<MacroData> {
  const selectTodaysMacrosQuery = {
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

  if (queryResult.rowCount === 0) {
    return new MacroData();
  }
  const resultDate = queryResult.rows[0].date.toISOString().split("T")[0];
  if (resultDate !== today) {
    return new MacroData();
  }
  return new MacroData(
    resultDate,
    queryResult.rows[0].calories,
    queryResult.rows[0].protein,
    queryResult.rows[0].carbohydrates,
    queryResult.rows[0].fats,
  );
}
