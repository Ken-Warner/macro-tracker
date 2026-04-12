import type { Request, Response } from "express";
import type { CreateComposedMealRequest, CreateMealRawRequest, GetMealHistoryRequestQuery, GetMealsRequestQuery, PutMealIsRecurringRequest } from "@macro-tracker/macro-tracker-shared";
declare function createNewMeal(req: Request<unknown, unknown, CreateComposedMealRequest>, res: Response): Promise<void>;
declare function createNewMealRaw(req: Request<unknown, unknown, CreateMealRawRequest>, res: Response): Promise<void>;
declare function getMealHistory(req: Request<unknown, unknown, unknown, Partial<GetMealHistoryRequestQuery>>, res: Response): Promise<void>;
declare function getMeals(req: Request<unknown, unknown, unknown, Partial<GetMealsRequestQuery>>, res: Response): Promise<void>;
declare function deleteMealById(req: Request<{
    id: string;
}, unknown, unknown, unknown>, res: Response): Promise<void>;
declare function putMealIsRecurring(req: Request<{
    id: string;
}, unknown, PutMealIsRecurringRequest>, res: Response): Promise<void>;
export { createNewMeal, createNewMealRaw, getMealHistory, getMeals, deleteMealById, putMealIsRecurring, };
//# sourceMappingURL=meals.controller.d.ts.map