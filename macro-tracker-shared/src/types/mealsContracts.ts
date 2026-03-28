/** Ingredient line item for a composed meal (`POST /`). */
export interface MealIngredient {
  ingredientId: number;
  portionSize: number;
}

/** Create a meal from ingredient IDs and portion sizes (`POST /`). */
export interface CreateComposedMealRequest {
  name: string;
  ingredients: MealIngredient[];
  description?: string;
  date?: string;
  time?: string;
}

/** Payload returned from `createMeal` (`201`). */
export interface CreateComposedMealResponse {
  id: number;
  name: string;
  description: string | null;
  date: string;
  time: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  user_id?: number;
  is_recurring?: boolean;
}

/** Create a meal with explicit macros (`POST /nonComposed`). */
export interface CreateMealRawRequest {
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
  date?: string;
  time?: string;
}

export interface CreateMealRawResponse {
  id: number;
  name: string;
  description: string | null;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  date: string;
  time: string;
}

/** Query for meal history (`GET /history`). */
export interface GetMealHistoryRequestQuery {
  fromDate: string;
  toDate: string;
}

/**
 * A meal row as grouped for history (`GET /history`).
 * Synthetic recurring rows may omit `id` and use `isRecurring` instead of `is_recurring`.
 */
export interface MealHistoryMeal {
  id?: number;
  name: string;
  description?: string | null;
  time?: string | null;
  date: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  is_recurring?: boolean;
  isRecurring?: boolean;
  userId?: string;
}

export interface MealHistoryDayGroup {
  mealsDate: string;
  meals: MealHistoryMeal[];
}

export type GetMealHistoryResponse = MealHistoryDayGroup[];

/** Query for meals on a given day offset (`GET /`). */
export interface GetMealsRequestQuery {
  daysAgo?: string;
}

/** Row from `getMealsFromDay` after JSON serialization (dates become ISO strings). */
export interface MealForDayResponseItem {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  date: string;
  time: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  is_recurring: boolean;
}

export type GetMealsResponse = MealForDayResponseItem[];

export interface DeleteMealRequestParams {
  id: string;
}

export type DeleteMealResponse = void;

export interface PutMealIsRecurringRequestParams {
  id: string;
}

export interface PutMealIsRecurringRequest {
  isRecurring: boolean;
}

export type PutMealIsRecurringResponse = void;

export interface MealsValidationErrorResponse {
  error: string;
}

export interface MealsServerErrorResponse {
  errorCode: string;
  errorMessage: string;
}
