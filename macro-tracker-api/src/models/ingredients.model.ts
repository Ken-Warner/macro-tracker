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

type RecipeComponentInput = {
  ingredientId: number;
  portionSize: number;
};

type DbIngredientRow = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fats: number | null;
  is_deleted: boolean;
};

type ComponentDbRow = {
  id: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

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
    return Ingredient.fromDbRow(result.rows[0] as DbIngredientRow);
  }
  return undefined;
}

export async function createIngredientFromComponents(
  userId: string,
  name: string,
  description: string | undefined,
  components: RecipeComponentInput[],
): Promise<Ingredient | undefined> {
  const getComponentsQuery = {
    text: `SELECT id, calories, protein, carbohydrates, fats
            FROM ingredients
            WHERE user_id = $1
            AND id IN (${components
              .map((_, idx) => "$" + String(idx + 2))
              .join(",")});`,
    params: [userId, ...components.map((c) => c.ingredientId)],
  };

  const newIngredient: RawIngredientInput = {
    name,
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0,
    ...(description !== undefined ? { description } : {}),
  };

  const componentsForNewIngredient = await query(getComponentsQuery);

  if (componentsForNewIngredient.rowCount !== components.length) {
    throw new Error("Ingredient not retrieved with ID");
  }

  const recipeAssociations: Array<{
    parentIngredientId?: number;
    componentIngredientId: number;
    portionSize: number;
  }> = [];

  for (const row of componentsForNewIngredient.rows as ComponentDbRow[]) {
    const portionSize =
      components.find((el) => el.ingredientId === row.id)?.portionSize ?? 0;

    recipeAssociations.push({
      componentIngredientId: row.id,
      portionSize,
    });

    newIngredient.calories =
      (newIngredient.calories ?? 0) + row.calories * portionSize;
    newIngredient.protein =
      (newIngredient.protein ?? 0) + row.protein * portionSize;
    newIngredient.carbohydrates =
      (newIngredient.carbohydrates ?? 0) + row.carbohydrates * portionSize;
    newIngredient.fats = (newIngredient.fats ?? 0) + row.fats * portionSize;
  }

  const finalNewIngredient = await createIngredientRaw(userId, newIngredient);

  if (!finalNewIngredient) {
    return undefined;
  }

  for (const ing of recipeAssociations) {
    ing.parentIngredientId = finalNewIngredient.id;
  }

  await insertRecipeComponents(recipeAssociations);

  return finalNewIngredient;
}

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
  return (result.rows as DbIngredientRow[]).map((row) =>
    Ingredient.fromDbRow(row),
  );
}

async function insertRecipeComponents(
  recipeComponents: Array<{
    parentIngredientId?: number;
    componentIngredientId: number;
    portionSize: number;
  }>,
) {
  const insertRecipeQuery = {
    text: `INSERT INTO recipes (parent_ingredient_id, component_ingredient_id, portion_size)
            VALUES ${recipeComponents
              .map((_, idx) => {
                const firstidx = 3 * idx + 1;
                return `($${String(firstidx)},$${String(firstidx + 1)}, $${String(firstidx + 2)})`;
              })
              .join(",")};`,

    params: recipeComponents
      .map((el) => [el.parentIngredientId, el.componentIngredientId, el.portionSize])
      .flat(),
  };

  return await query(insertRecipeQuery);
}
