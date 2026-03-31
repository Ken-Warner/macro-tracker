/** Line item when creating an ingredient from existing ingredients (`POST /` with `components`). */
export interface ComposedIngredientComponent {
  ingredientId: number;
  portionSize: number;
}

/** Request body for `POST /` (raw macros or composed from `components`). */
export interface CreateNewIngredientRequest {
  ingredient: {
    name: string;
    description?: string;
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fats?: number;
  };
  components?: ComposedIngredientComponent[];
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
  errorCode: string;
  errorMessage: string;
}
