import { Meal, type CreateComposedMealRequest } from "@macro-tracker/macro-tracker-shared";
type MealInsertPayload = {
    name: string;
    description: string | undefined;
    date: string | undefined;
    time: string | undefined;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
};
/** Controller / composed-meal raw insert input; normalized inside `createMealRaw`. */
export type MealRawInput = {
    name: string;
    description?: string | undefined;
    date?: string | undefined;
    time?: string | undefined;
    calories?: number | undefined;
    protein?: number | undefined;
    carbohydrates?: number | undefined;
    fats?: number | undefined;
};
export type RecurringMealBatchRow = {
    userId: string;
    name: string;
    description: string | null;
    date: Date;
    time: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    isRecurring: boolean;
};
export type MacroTotalsBatchRow = {
    userId: string;
    date: Date;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
};
export declare function createMeal(userId: string, meal: CreateComposedMealRequest): Promise<Meal>;
export declare function createMealRaw(userId: string, meal: MealRawInput | MealInsertPayload): Promise<Meal>;
export declare function getMealsFromDay(userId: string, daysAgo: number): Promise<Meal[]>;
export declare function deleteMeal(userId: string, mealId: string): Promise<void>;
export declare function getMealHistoryWithRange(userId: string, fromDate: string, toDate: string): Promise<Meal[]>;
export declare function updateMealIsRecurring(mealId: string, userId: string, isRecurring: boolean): Promise<number>;
export declare function selectRecurringMeals(userId: string): Promise<Meal[]>;
export declare function insertMealsFromRecurringUpdate(newMeals: RecurringMealBatchRow[], newMacroTotals: MacroTotalsBatchRow[]): Promise<void>;
export {};
//# sourceMappingURL=meals.model.d.ts.map