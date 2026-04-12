import { WeighInData } from "@macro-tracker/macro-tracker-shared";
import { query, DEFAULT, buildInsert } from "./pool.js";

type PostWeighInInput = {
  weight: number;
  date?: string;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbohydrates?: number;
  targetFats?: number;
};

export async function insertWeighInData(
  userId: string,
  weighInData: PostWeighInInput,
): Promise<void> {
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

type RecentWeighInRow = {
  date: Date;
  weight: number;
  target_calories: number | null;
  target_protein: number | null;
  target_carbohydrates: number | null;
  target_fats: number | null;
};

export async function selectRecentWeighInData(
  userId: string,
): Promise<WeighInData | undefined> {
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
  const row = result.rows[0] as RecentWeighInRow | undefined;
  if (!row) {
    return undefined;
  }
  return WeighInData.fromRecentRow(row);
}

export async function selectWeighInDataForDateRange(
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<WeighInData[]> {
  const weighInDataQuery = {
    text: `SELECT date, weight
            FROM user_weights
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3;`,
    params: [userId, fromDate, toDate],
  };

  const result = await query(weighInDataQuery);

  return (result.rows as { date: Date; weight: number }[]).map((row) =>
    WeighInData.fromRangeRow(row),
  );
}
