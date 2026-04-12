import { WeighInData } from "@macro-tracker/macro-tracker-shared";
import { query, DEFAULT, buildInsert } from "./pool.js";
export async function insertWeighInData(userId, weighInData) {
    const fields = [
        "user_id",
        "weight",
        "date",
        "target_calories",
        "target_protein",
        "target_carbohydrates",
        "target_fats",
    ];
    const values = [
        userId,
        weighInData.weight,
        weighInData.date ?? DEFAULT,
        weighInData.targetCalories ?? DEFAULT,
        weighInData.targetProtein ?? DEFAULT,
        weighInData.targetCarbohydrates ?? DEFAULT,
        weighInData.targetFats ?? DEFAULT,
    ];
    const [queryFields, queryValues, queryParams] = buildInsert(fields, values);
    const insertWeighInDataQuery = {
        text: `INSERT INTO user_weights ${queryFields}
            VALUES ${queryValues}
            RETURNING *;`,
        params: queryParams,
    };
    const result = await query(insertWeighInDataQuery);
    if (result.rowCount !== 1) {
        throw new Error("Unable to insert new weight");
    }
}
export async function selectRecentWeighInData(userId) {
    const weighInDataQuery = {
        text: `SELECT weight,
                  date,
                  target_calories,
                  target_protein,
                  target_carbohydrates,
                  target_fats
              FROM user_weights
              WHERE user_id = $1
              ORDER BY date DESC
              LIMIT 1;`,
        params: [userId],
    };
    const result = await query(weighInDataQuery);
    const row = result.rows[0];
    if (!row) {
        return undefined;
    }
    return WeighInData.fromRecentRow(row);
}
export async function selectWeighInDataForDateRange(userId, fromDate, toDate) {
    const weighInDataQuery = {
        text: `SELECT date, weight
            FROM user_weights
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3;`,
        params: [userId, fromDate, toDate],
    };
    const result = await query(weighInDataQuery);
    return result.rows.map((row) => WeighInData.fromRangeRow(row));
}
//# sourceMappingURL=weighIn.model.js.map