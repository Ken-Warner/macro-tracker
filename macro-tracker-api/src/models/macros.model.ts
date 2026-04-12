import { MacroData } from "@macro-tracker/macro-tracker-shared";
import { query } from "./pool.js";

type MacroTotalsRow = {
  date: Date;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

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

  return (result.rows as MacroTotalsRow[]).map((row) =>
    MacroData.fromDbRow(row),
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
    return MacroData.empty();
  }
  const result = queryResult.rows[0] as MacroTotalsRow;
  if (result.date.toISOString().split("T")[0] !== today) {
    return MacroData.empty();
  }
  return MacroData.fromDbRow(result);
}
