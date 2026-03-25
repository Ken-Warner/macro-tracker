export function createMeal(userId: any, meal: any): Promise<any>;
export function createMealRaw(userId: any, meal: any): Promise<any>;
export function getMealsFromDay(userId: any, daysAgo: any): Promise<any>;
export function getMealHistoryWithRange(userId: any, fromDate: any, toDate: any): Promise<any>;
export function deleteMeal(userId: any, mealId: any): Promise<void>;
export function updateMealIsRecurring(mealId: any, userId: any, isRecurring: any): Promise<any>;
export function selectRecurringMeals(userId: any): Promise<any>;
export function insertMealsFromRecurringUpdate(newMeals: any, newMacroTotals: any): Promise<void>;
//# sourceMappingURL=meals.model.d.ts.map