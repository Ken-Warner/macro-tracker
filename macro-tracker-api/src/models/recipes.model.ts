import {
  Recipe,
  type CreateRecipeRequest,
  type PatchRecipeRequest,
  type RecipeDivisionMode,
  type RecipeIngredientLine,
} from "@macro-tracker/macro-tracker-shared";
import { query, withTransaction, queryWithClient } from "./pool.js";

type RecipeDbRow = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  division_mode: RecipeDivisionMode;
  portion_count: number | null;
  total_yield_oz: number | null;
};

type RecipeIngredientJoinRow = {
  recipe_id: number;
  ingredient_id: number;
  name: string;
  default_amount: number;
  current_amount: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

function groupIngredientsByRecipe(
  rows: RecipeIngredientJoinRow[],
): Map<number, RecipeIngredientLine[]> {
  const map = new Map<number, RecipeIngredientLine[]>();
  for (const row of rows) {
    const line: RecipeIngredientLine = {
      ingredient_id: row.ingredient_id,
      name: row.name,
      default_amount: row.default_amount,
      current_amount: row.current_amount,
      calories: row.calories,
      protein: row.protein,
      carbohydrates: row.carbohydrates,
      fats: row.fats,
    };
    const existing = map.get(row.recipe_id);
    if (existing) {
      existing.push(line);
    } else {
      map.set(row.recipe_id, [line]);
    }
  }
  return map;
}

function recipeFromRow(
  row: RecipeDbRow,
  ingredients: RecipeIngredientLine[],
): Recipe {
  return Recipe.fromDbRow({
    ...row,
    ingredients,
  });
}

async function loadIngredientLinesForRecipes(
  userId: string,
  recipeIds: number[],
): Promise<Map<number, RecipeIngredientLine[]>> {
  if (recipeIds.length === 0) {
    return new Map();
  }

  const placeholders = recipeIds
    .map((_, idx) => "$" + String(idx + 2))
    .join(",");
  const result = await query({
    text: `SELECT ri.recipe_id, ri.ingredient_id, i.name,
                  ri.default_amount, ri.current_amount,
                  i.calories, i.protein, i.carbohydrates, i.fats
           FROM recipe_ingredients ri
           INNER JOIN ingredients i ON i.id = ri.ingredient_id
           WHERE i.user_id = $1
             AND ri.recipe_id IN (${placeholders})
           ORDER BY i.name ASC;`,
    params: [userId, ...recipeIds],
  });

  return groupIngredientsByRecipe(result.rows as RecipeIngredientJoinRow[]);
}

export async function getRecipesByUserId(userId: string): Promise<Recipe[]> {
  const recipesResult = await query({
    text: `SELECT id, user_id, name, description, division_mode,
                  portion_count, total_yield_oz
           FROM recipes
           WHERE user_id = $1
           ORDER BY name ASC;`,
    params: [userId],
  });

  const rows = recipesResult.rows as RecipeDbRow[];
  const ingredientMap = await loadIngredientLinesForRecipes(
    userId,
    rows.map((r) => r.id),
  );

  return rows.map((row) =>
    recipeFromRow(row, ingredientMap.get(row.id) ?? []),
  );
}

export async function getRecipeById(
  userId: string,
  recipeId: number,
): Promise<Recipe | undefined> {
  const recipesResult = await query({
    text: `SELECT id, user_id, name, description, division_mode,
                  portion_count, total_yield_oz
           FROM recipes
           WHERE user_id = $1 AND id = $2;`,
    params: [userId, recipeId],
  });

  if (recipesResult.rowCount !== 1) {
    return undefined;
  }

  const row = recipesResult.rows[0] as RecipeDbRow;
  const ingredientMap = await loadIngredientLinesForRecipes(userId, [row.id]);
  return recipeFromRow(row, ingredientMap.get(row.id) ?? []);
}

export async function getRecipesByIds(
  userId: string,
  recipeIds: number[],
): Promise<Recipe[]> {
  if (recipeIds.length === 0) {
    return [];
  }

  const placeholders = recipeIds
    .map((_, idx) => "$" + String(idx + 2))
    .join(",");
  const recipesResult = await query({
    text: `SELECT id, user_id, name, description, division_mode,
                  portion_count, total_yield_oz
           FROM recipes
           WHERE user_id = $1
             AND id IN (${placeholders});`,
    params: [userId, ...recipeIds],
  });

  const rows = recipesResult.rows as RecipeDbRow[];
  const ingredientMap = await loadIngredientLinesForRecipes(
    userId,
    rows.map((r) => r.id),
  );

  return rows.map((row) =>
    recipeFromRow(row, ingredientMap.get(row.id) ?? []),
  );
}

export async function createRecipe(
  userId: string,
  input: CreateRecipeRequest,
): Promise<Recipe> {
  const ingredientIds = input.ingredients.map((i) => i.ingredientId);
  const uniqueIds = new Set(ingredientIds);
  if (uniqueIds.size !== ingredientIds.length) {
    throw new Error("Duplicate ingredients are not allowed in a recipe.");
  }

  const owned = await query({
    text: `SELECT id FROM ingredients
           WHERE user_id = $1
             AND is_deleted = FALSE
             AND id IN (${ingredientIds.map((_, idx) => "$" + String(idx + 2)).join(",")});`,
    params: [userId, ...ingredientIds],
  });

  if ((owned.rowCount ?? 0) !== ingredientIds.length) {
    throw new Error("One or more ingredients were not found in your pantry.");
  }

  const portionCount =
    input.divisionMode === "portions" ? (input.portionCount ?? null) : null;
  const totalYieldOz =
    input.divisionMode === "per_ounce" ? (input.totalYieldOz ?? null) : null;

  const recipeId = await withTransaction(async (client) => {
    const insertRecipe = await queryWithClient(client, {
      text: `INSERT INTO recipes
              (user_id, name, description, division_mode, portion_count, total_yield_oz)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id;`,
      params: [
        userId,
        input.name,
        input.description ?? "",
        input.divisionMode,
        portionCount,
        totalYieldOz,
      ],
    });

    const newId = (insertRecipe.rows[0] as { id: number }).id;

    for (const line of input.ingredients) {
      await queryWithClient(client, {
        text: `INSERT INTO recipe_ingredients
                (recipe_id, ingredient_id, default_amount, current_amount)
               VALUES ($1, $2, $3, $3);`,
        params: [newId, line.ingredientId, line.defaultAmount],
      });
    }

    return newId;
  });

  const recipe = await getRecipeById(userId, recipeId);
  if (!recipe) {
    throw new Error("Failed to load created recipe.");
  }
  return recipe;
}

export async function patchRecipe(
  userId: string,
  recipeId: number,
  input: PatchRecipeRequest,
): Promise<Recipe | undefined> {
  const existing = await getRecipeById(userId, recipeId);
  if (!existing) {
    return undefined;
  }

  await withTransaction(async (client) => {
    if (
      input.totalYieldOz !== undefined &&
      existing.divisionMode === "per_ounce"
    ) {
      await queryWithClient(client, {
        text: `UPDATE recipes
               SET total_yield_oz = $1
               WHERE user_id = $2 AND id = $3;`,
        params: [input.totalYieldOz, userId, recipeId],
      });
    }

    if (input.ingredients && input.ingredients.length > 0) {
      const allowedIds = new Set(
        existing.ingredients.map((line) => line.ingredient_id),
      );

      for (const line of input.ingredients) {
        if (!allowedIds.has(line.ingredientId)) {
          throw new Error(
            "Cannot add or change ingredients on an existing recipe.",
          );
        }
        await queryWithClient(client, {
          text: `UPDATE recipe_ingredients
                 SET current_amount = $1
                 WHERE recipe_id = $2 AND ingredient_id = $3;`,
          params: [line.currentAmount, recipeId, line.ingredientId],
        });
      }
    }
  });

  return getRecipeById(userId, recipeId);
}

export async function resetRecipeAmounts(
  userId: string,
  recipeId: number,
): Promise<Recipe | undefined> {
  const existing = await getRecipeById(userId, recipeId);
  if (!existing) {
    return undefined;
  }

  await query({
    text: `UPDATE recipe_ingredients
           SET current_amount = default_amount
           WHERE recipe_id = $1;`,
    params: [recipeId],
  });

  return getRecipeById(userId, recipeId);
}

export async function deleteRecipeById(
  userId: string,
  recipeId: number,
): Promise<number> {
  const result = await query({
    text: `DELETE FROM recipes
           WHERE user_id = $1 AND id = $2;`,
    params: [userId, recipeId],
  });
  return result.rowCount ?? 0;
}

export async function getRecipeNamesUsingIngredient(
  userId: string,
  ingredientId: number,
): Promise<string[]> {
  const result = await query({
    text: `SELECT r.name
           FROM recipes r
           INNER JOIN recipe_ingredients ri ON ri.recipe_id = r.id
           WHERE r.user_id = $1
             AND ri.ingredient_id = $2
           ORDER BY r.name ASC;`,
    params: [userId, ingredientId],
  });

  return (result.rows as { name: string }[]).map((row) => row.name);
}
