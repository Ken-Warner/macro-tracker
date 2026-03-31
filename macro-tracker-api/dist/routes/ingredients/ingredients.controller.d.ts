import type { Request, Response } from "express";
import type { CreateNewIngredientRequest, DeleteIngredientRequestParams } from "@macro-tracker/macro-tracker-shared";
declare function createNewIngredient(req: Request<unknown, unknown, CreateNewIngredientRequest>, res: Response): Promise<void>;
declare function deleteIngredient(req: Request<DeleteIngredientRequestParams>, res: Response): Promise<void>;
declare function getIngredients(req: Request, res: Response): Promise<void>;
export { createNewIngredient, deleteIngredient, getIngredients };
//# sourceMappingURL=ingredients.controller.d.ts.map