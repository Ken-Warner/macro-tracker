import type { RecipeDivisionMode } from "./entities/recipe.js";

export const PANTRY_EXPORT_FORMAT = "macro-tracker-pantry" as const;
export const PANTRY_EXPORT_VERSION = 1 as const;

export interface PantryExportIngredientV1 {
  key: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

export interface PantryExportRecipeIngredientV1 {
  ingredient_key: string;
  default_amount: number;
  current_amount: number;
}

export interface PantryExportRecipeV1 {
  key: string;
  name: string;
  description: string;
  division_mode: RecipeDivisionMode;
  portion_count: number | null;
  total_yield_oz: number | null;
  ingredients: PantryExportRecipeIngredientV1[];
}

/** Portable pantry dump (`GET /api/pantry/export`, `POST /api/pantry/import`). */
export interface PantryExportV1 {
  format: typeof PANTRY_EXPORT_FORMAT;
  version: typeof PANTRY_EXPORT_VERSION;
  exported_at: string;
  ingredients: PantryExportIngredientV1[];
  recipes: PantryExportRecipeV1[];
}

export type GetPantryExportResponse = PantryExportV1;

export interface ImportPantryRequest {
  /** Defaults to replace when omitted. */
  mode?: "replace";
  pantry: PantryExportV1;
}

export interface ImportPantryResponse {
  ingredients_imported: number;
  recipes_imported: number;
}

export interface PantryValidationErrorResponse {
  error: string;
}

export interface PantryServerErrorResponse {
  errorMessage: string;
}
