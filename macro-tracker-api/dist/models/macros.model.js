import { MacroData } from "@macro-tracker/macro-tracker-shared";
import { query } from "./pool.js";
export async function selectMacrosFromDateRange(userId, fromDate, toDate) {
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
    return result.rows.map((row) => MacroData.fromDbRow(row));
}
export async function selectTodaysMacros(userId, today) {
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
    const result = queryResult.rows[0];
    if (result.date.toISOString().split("T")[0] !== today) {
        return MacroData.empty();
    }
    return MacroData.fromDbRow(result);
}
//# sourceMappingURL=macros.model.js.map