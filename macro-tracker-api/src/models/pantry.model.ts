import {
  PANTRY_EXPORT_FORMAT,
  PANTRY_EXPORT_VERSION,
  type ImportPantryResponse,
  type PantryExportIngredientV1,
  type PantryExportRecipeV1,
  type PantryExportV1,
} from "@macro-tracker/macro-tracker-shared";
import { getIngredientsByUserId } from "./ingredients.model.js";
import { getRecipesByUserId } from "./recipes.model.js";
import { queryWithClient, withTransaction } from "./pool.js";

export class PantryImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PantryImportValidationError";
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new PantryImportValidationError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function validateIngredient(
  raw: unknown,
  index: number,
): PantryExportIngredientV1 {
  if (typeof raw !== "object" || raw === null) {
    throw new PantryImportValidationError(
      `ingredients[${String(index)}] must be an object`,
    );
  }

  const row = raw as Record<string, unknown>;
  const key = assertString(row.key, `ingredients[${String(index)}].key`);
  const name = assertString(row.name, `ingredients[${String(index)}].name`);

  if (!isNonNegativeNumber(row.calories)) {
    throw new PantryImportValidationError(
      `ingredients[${String(index)}].calories must be a number >= 0`,
    );
  }
  if (!isNonNegativeNumber(row.protein)) {
    throw new PantryImportValidationError(
      `ingredients[${String(index)}].protein must be a number >= 0`,
    );
  }
  if (!isNonNegativeNumber(row.carbohydrates)) {
    throw new PantryImportValidationError(
      `ingredients[${String(index)}].carbohydrates must be a number >= 0`,
    );
  }
  if (!isNonNegativeNumber(row.fats)) {
    throw new PantryImportValidationError(
      `ingredients[${String(index)}].fats must be a number >= 0`,
    );
  }

  const description =
    typeof row.description === "string" ? row.description : "";

  return {
    key,
    name,
    description,
    calories: row.calories,
    protein: row.protein,
    carbohydrates: row.carbohydrates,
    fats: row.fats,
  };
}

function validateRecipe(
  raw: unknown,
  index: number,
  ingredientKeys: Set<string>,
): PantryExportRecipeV1 {
  if (typeof raw !== "object" || raw === null) {
    throw new PantryImportValidationError(
      `recipes[${String(index)}] must be an object`,
    );
  }

  const row = raw as Record<string, unknown>;
  const key = assertString(row.key, `recipes[${String(index)}].key`);
  const name = assertString(row.name, `recipes[${String(index)}].name`);
  const description =
    typeof row.description === "string" ? row.description : "";

  if (row.division_mode !== "portions" && row.division_mode !== "per_ounce") {
    throw new PantryImportValidationError(
      `recipes[${String(index)}].division_mode must be 'portions' or 'per_ounce'`,
    );
  }

  let portionCount: number | null = null;
  let totalYieldOz: number | null = null;

  if (row.division_mode === "portions") {
    if (!isPositiveNumber(row.portion_count)) {
      throw new PantryImportValidationError(
        `recipes[${String(index)}].portion_count must be greater than 0`,
      );
    }
    portionCount = row.portion_count;
  } else {
    if (!isPositiveNumber(row.total_yield_oz)) {
      throw new PantryImportValidationError(
        `recipes[${String(index)}].total_yield_oz must be greater than 0`,
      );
    }
    totalYieldOz = row.total_yield_oz;
  }

  if (!Array.isArray(row.ingredients) || row.ingredients.length < 1) {
    throw new PantryImportValidationError(
      `recipes[${String(index)}] must include at least one ingredient`,
    );
  }

  const lineKeys = new Set<string>();
  const ingredients = row.ingredients.map((lineRaw, lineIndex) => {
    if (typeof lineRaw !== "object" || lineRaw === null) {
      throw new PantryImportValidationError(
        `recipes[${String(index)}].ingredients[${String(lineIndex)}] must be an object`,
      );
    }
    const line = lineRaw as Record<string, unknown>;
    const ingredientKey = assertString(
      line.ingredient_key,
      `recipes[${String(index)}].ingredients[${String(lineIndex)}].ingredient_key`,
    );

    if (!ingredientKeys.has(ingredientKey)) {
      throw new PantryImportValidationError(
        `recipes[${String(index)}] references unknown ingredient_key '${ingredientKey}'`,
      );
    }
    if (lineKeys.has(ingredientKey)) {
      throw new PantryImportValidationError(
        `recipes[${String(index)}] has duplicate ingredient_key '${ingredientKey}'`,
      );
    }
    lineKeys.add(ingredientKey);

    if (!isPositiveNumber(line.default_amount)) {
      throw new PantryImportValidationError(
        `recipes[${String(index)}].ingredients[${String(lineIndex)}].default_amount must be greater than 0`,
      );
    }
    if (!isPositiveNumber(line.current_amount)) {
      throw new PantryImportValidationError(
        `recipes[${String(index)}].ingredients[${String(lineIndex)}].current_amount must be greater than 0`,
      );
    }

    return {
      ingredient_key: ingredientKey,
      default_amount: line.default_amount,
      current_amount: line.current_amount,
    };
  });

  return {
    key,
    name,
    description,
    division_mode: row.division_mode,
    portion_count: portionCount,
    total_yield_oz: totalYieldOz,
    ingredients,
  };
}

export function parsePantryExport(raw: unknown): PantryExportV1 {
  if (typeof raw !== "object" || raw === null) {
    throw new PantryImportValidationError("Pantry payload must be an object");
  }

  const payload = raw as Record<string, unknown>;

  if (payload.format !== PANTRY_EXPORT_FORMAT) {
    throw new PantryImportValidationError(
      `Unsupported format (expected '${PANTRY_EXPORT_FORMAT}')`,
    );
  }
  if (payload.version !== PANTRY_EXPORT_VERSION) {
    throw new PantryImportValidationError(
      `Unsupported pantry export version (expected ${String(PANTRY_EXPORT_VERSION)})`,
    );
  }
  if (typeof payload.exported_at !== "string" || payload.exported_at === "") {
    throw new PantryImportValidationError("exported_at must be a non-empty string");
  }
  if (!Array.isArray(payload.ingredients)) {
    throw new PantryImportValidationError("ingredients must be an array");
  }
  if (!Array.isArray(payload.recipes)) {
    throw new PantryImportValidationError("recipes must be an array");
  }

  const ingredients = payload.ingredients.map((item, index) =>
    validateIngredient(item, index),
  );

  const ingredientKeys = new Set<string>();
  for (const ingredient of ingredients) {
    if (ingredientKeys.has(ingredient.key)) {
      throw new PantryImportValidationError(
        `Duplicate ingredient key '${ingredient.key}'`,
      );
    }
    ingredientKeys.add(ingredient.key);
  }

  const recipes = payload.recipes.map((item, index) =>
    validateRecipe(item, index, ingredientKeys),
  );

  const recipeKeys = new Set<string>();
  for (const recipe of recipes) {
    if (recipeKeys.has(recipe.key)) {
      throw new PantryImportValidationError(
        `Duplicate recipe key '${recipe.key}'`,
      );
    }
    recipeKeys.add(recipe.key);
  }

  return {
    format: PANTRY_EXPORT_FORMAT,
    version: PANTRY_EXPORT_VERSION,
    exported_at: payload.exported_at,
    ingredients,
    recipes,
  };
}

export async function exportPantry(userId: string): Promise<PantryExportV1> {
  const [ingredients, recipes] = await Promise.all([
    getIngredientsByUserId(userId),
    getRecipesByUserId(userId),
  ]);

  const referencedIds = new Set<number>();
  for (const recipe of recipes) {
    for (const line of recipe.ingredients) {
      referencedIds.add(line.ingredient_id);
    }
  }

  const exportIngredients = ingredients.filter(
    (ingredient) => !ingredient.isDeleted || referencedIds.has(ingredient.id),
  );

  return {
    format: PANTRY_EXPORT_FORMAT,
    version: PANTRY_EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    ingredients: exportIngredients.map((ingredient) => ({
      key: `ing_${String(ingredient.id)}`,
      name: ingredient.name,
      description: ingredient.description,
      calories: ingredient.calories,
      protein: ingredient.protein,
      carbohydrates: ingredient.carbohydrates,
      fats: ingredient.fats,
    })),
    recipes: recipes.map((recipe) => ({
      key: `rec_${String(recipe.id)}`,
      name: recipe.name,
      description: recipe.description,
      division_mode: recipe.divisionMode,
      portion_count: recipe.portionCount,
      total_yield_oz: recipe.totalYieldOz,
      ingredients: recipe.ingredients.map((line) => ({
        ingredient_key: `ing_${String(line.ingredient_id)}`,
        default_amount: line.default_amount,
        current_amount: line.current_amount,
      })),
    })),
  };
}

export async function importPantryReplace(
  userId: string,
  pantry: PantryExportV1,
): Promise<ImportPantryResponse> {
  return withTransaction(async (client) => {
    await queryWithClient(client, {
      text: `DELETE FROM recipes WHERE user_id = $1;`,
      params: [userId],
    });

    await queryWithClient(client, {
      text: `DELETE FROM ingredients WHERE user_id = $1;`,
      params: [userId],
    });

    const keyToId = new Map<string, number>();

    for (const ingredient of pantry.ingredients) {
      const insertResult = await queryWithClient(client, {
        text: `INSERT INTO ingredients
                (user_id, name, description, calories, protein, carbohydrates, fats)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               RETURNING id;`,
        params: [
          userId,
          ingredient.name,
          ingredient.description,
          ingredient.calories,
          ingredient.protein,
          ingredient.carbohydrates,
          ingredient.fats,
        ],
      });
      const newId = (insertResult.rows[0] as { id: number }).id;
      keyToId.set(ingredient.key, newId);
    }

    for (const recipe of pantry.recipes) {
      const insertRecipe = await queryWithClient(client, {
        text: `INSERT INTO recipes
                (user_id, name, description, division_mode, portion_count, total_yield_oz)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id;`,
        params: [
          userId,
          recipe.name,
          recipe.description,
          recipe.division_mode,
          recipe.portion_count,
          recipe.total_yield_oz,
        ],
      });
      const recipeId = (insertRecipe.rows[0] as { id: number }).id;

      for (const line of recipe.ingredients) {
        const ingredientId = keyToId.get(line.ingredient_key);
        if (ingredientId === undefined) {
          throw new PantryImportValidationError(
            `Missing ingredient for key '${line.ingredient_key}'`,
          );
        }
        await queryWithClient(client, {
          text: `INSERT INTO recipe_ingredients
                  (recipe_id, ingredient_id, default_amount, current_amount)
                 VALUES ($1, $2, $3, $4);`,
          params: [
            recipeId,
            ingredientId,
            line.default_amount,
            line.current_amount,
          ],
        });
      }
    }

    return {
      ingredients_imported: pantry.ingredients.length,
      recipes_imported: pantry.recipes.length,
    };
  });
}
