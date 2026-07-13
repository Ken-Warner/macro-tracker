import type { RecipeDivisionMode, RecipeIngredientLine, RecipeMacros } from "./entities/recipe.js";

/** Ingredient line when creating a recipe (`POST /api/recipes`). */
export interface CreateRecipeIngredientInput {
  ingredientId: number;
  defaultAmount: number;
}

/** Create a recipe (`POST /api/recipes`). */
export interface CreateRecipeRequest {
  name: string;
  description?: string;
  divisionMode: RecipeDivisionMode;
  portionCount?: number;
  totalYieldOz?: number;
  ingredients: CreateRecipeIngredientInput[];
}

/** Live-batch update (`PATCH /api/recipes/:id`). */
export interface PatchRecipeRequest {
  totalYieldOz?: number;
  ingredients?: Array<{
    ingredientId: number;
    currentAmount: number;
  }>;
}

/** Recipe row as returned from list/create/patch/reset. */
export interface RecipeRow {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  division_mode: RecipeDivisionMode;
  portion_count: number | null;
  total_yield_oz: number | null;
  ingredients: RecipeIngredientLine[];
  macros_total: RecipeMacros;
  macros_per_unit: RecipeMacros;
}

export type CreateRecipeResponse = RecipeRow;
export type GetRecipesResponse = RecipeRow[];
export type PatchRecipeResponse = RecipeRow;
export type ResetRecipeResponse = RecipeRow;

export interface RecipeIdParams {
  recipeId: string;
}

export type DeleteRecipeResponse = void;

export interface RecipesValidationErrorResponse {
  error: string;
}

export interface RecipesServerErrorResponse {
  errorMessage: string;
}

export interface RecipesConflictErrorResponse {
  error: string;
}
