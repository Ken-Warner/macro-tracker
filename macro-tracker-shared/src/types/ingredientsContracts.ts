/** Request body for `POST /` (raw macros). */
export interface CreateNewIngredientRequest {
  ingredient: {
    name: string;
    description?: string;
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fats?: number;
  };
}

/** Ingredient row as returned from list/create (`GET /`, `POST /` `201`). */
export interface IngredientRow {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fats: number | null;
  is_deleted: boolean;
}

/** Response for successful create (`201`). */
export type CreateIngredientResponse = IngredientRow;

export type GetIngredientsResponse = IngredientRow[];

export interface DeleteIngredientRequestParams {
  ingredientId: string;
}

export type DeleteIngredientResponse = void;

export interface IngredientsValidationErrorResponse {
  error: string;
}

export interface IngredientsServerErrorResponse {
  errorMessage: string;
}

export interface GetIngredientFromImageResponse {
  success: boolean;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

export const MAX_INGREDIENT_IMAGE_BYTES = 8 * 1024 * 1024;

export const INGREDIENT_IMAGE_FIELD_NAME = "image";

export const ALLOWED_INGREDIENT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_INGREDIENT_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

export type AllowedIngredientImageMime =
  (typeof ALLOWED_INGREDIENT_IMAGE_MIME_TYPES)[number];

export type AllowedIngredientImageExtension =
  (typeof ALLOWED_INGREDIENT_IMAGE_EXTENSIONS)[number];

const allowedMimeSet = new Set<string>(ALLOWED_INGREDIENT_IMAGE_MIME_TYPES);
const allowedExtSet = new Set<string>(ALLOWED_INGREDIENT_IMAGE_EXTENSIONS);

export function isAllowedIngredientImageMime(
  mime: string,
): mime is AllowedIngredientImageMime {
  return allowedMimeSet.has(mime);
}

export function isAllowedIngredientImageExtension(
  ext: string,
): ext is AllowedIngredientImageExtension {
  return allowedExtSet.has(ext.toLowerCase());
}
