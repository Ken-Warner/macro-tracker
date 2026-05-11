import { Ingredient } from "@macro-tracker/macro-tracker-shared";
import { query } from "./pool.js";

type RawIngredientInput = {
  name: string;
  description?: string | undefined;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
};

type DbIngredientRow = {
  id: number;
  user_id: number;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  is_deleted: boolean;
};

//TODO update to use ingredient entity
export async function createIngredientRaw(
  userId: string,
  ingredient: RawIngredientInput,
): Promise<Ingredient | undefined> {
  const createIngredientQuery = {
    text: `INSERT INTO ingredients
            (user_id, name, description, calories, protein, carbohydrates, fats)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;`,
    params: [
      userId,
      ingredient.name,
      ingredient.description ?? "",
      ingredient.calories ?? 0,
      ingredient.protein ?? 0,
      ingredient.carbohydrates ?? 0,
      ingredient.fats ?? 0,
    ],
  };

  const result = await query(createIngredientQuery);

  if (result.rowCount === 1) {
    let ingredient = new Ingredient(
      result.rows[0].name,
      result.rows[0].calories,
      result.rows[0].protein,
      result.rows[0].carbohydrates,
      result.rows[0].fats,
    );

    ingredient.userId = result.rows[0].user_id;
    ingredient.id = result.rows[0].id;
    ingredient.description = result.rows[0].description;

    return ingredient;
  }
  return undefined;
}

//TODO update to use ingredient entity
export async function deleteIngredientById(
  userId: string,
  ingredientId: number,
): Promise<number> {
  const deleteIngredientQuery = {
    text: `UPDATE ingredients
            SET is_deleted = TRUE
            WHERE user_id = $1
              AND id = $2;`,
    params: [userId, ingredientId],
  };

  const result = await query(deleteIngredientQuery);

  return result.rowCount ?? 0;
}

//TODO update to use ingredient entity
export async function getIngredientsByUserId(
  userId: string,
): Promise<Ingredient[]> {
  const selectIngredientsQuery = {
    text: `SELECT *
            FROM ingredients
            WHERE user_id = $1;`,
    params: [userId],
  };

  const result = await query(selectIngredientsQuery);
  return (result.rows as DbIngredientRow[]).map((row) => {
    let ingredient = new Ingredient(
      row.name,
      row.calories,
      row.protein,
      row.carbohydrates,
      row.fats,
    );
    ingredient.userId = row.user_id;
    ingredient.id = row.id;
    ingredient.description = row.description;
    ingredient.isDeleted = row.is_deleted;
    return ingredient;
  });
}
