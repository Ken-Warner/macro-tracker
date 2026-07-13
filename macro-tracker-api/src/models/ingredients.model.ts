import type pg from "pg";
import { Ingredient } from "@macro-tracker/macro-tracker-shared";
import { DEFAULT_PANTRY_INGREDIENTS } from "../data/defaultPantryIngredients.js";
import { IngredientInUseError } from "../errors/IngredientInUseError.js";
import { query, queryWithClient } from "./pool.js";
import { getRecipeNamesUsingIngredient } from "./recipes.model.js";

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

export async function createIngredient(
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

export async function seedDefaultIngredients(
  userId: string,
  client: pg.PoolClient,
): Promise<void> {
  if (DEFAULT_PANTRY_INGREDIENTS.length === 0) {
    return;
  }

  const valuePlaceholders: string[] = [];
  const params: unknown[] = [userId];
  let paramIndex = 2;

  for (const ingredient of DEFAULT_PANTRY_INGREDIENTS) {
    valuePlaceholders.push(
      `($1, $${String(paramIndex)}, $${String(paramIndex + 1)}, $${String(paramIndex + 2)}, $${String(paramIndex + 3)}, $${String(paramIndex + 4)}, $${String(paramIndex + 5)})`,
    );
    params.push(
      ingredient.name,
      ingredient.description,
      ingredient.calories,
      ingredient.protein,
      ingredient.carbohydrates,
      ingredient.fats,
    );
    paramIndex += 6;
  }

  await queryWithClient(client, {
    text: `INSERT INTO ingredients
            (user_id, name, description, calories, protein, carbohydrates, fats)
            VALUES ${valuePlaceholders.join(", ")};`,
    params,
  });
}

//TODO update to use ingredient entity
export async function deleteIngredientById(
  userId: string,
  ingredientId: number,
): Promise<number> {
  const recipeNames = await getRecipeNamesUsingIngredient(userId, ingredientId);
  if (recipeNames.length > 0) {
    throw new IngredientInUseError(recipeNames);
  }

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
