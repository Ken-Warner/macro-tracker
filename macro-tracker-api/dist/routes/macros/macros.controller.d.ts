import type { Request, Response } from "express";
import type { GetMacrosFromDateRangeRequestQuery, GetTodaysMacrosRequestQuery } from "@macro-tracker/macro-tracker-shared";
declare function getMacrosFromDateRange(req: Request<unknown, unknown, unknown, Partial<GetMacrosFromDateRangeRequestQuery>>, res: Response): Promise<void>;
declare function getTodaysMacros(req: Request<unknown, unknown, unknown, Partial<GetTodaysMacrosRequestQuery>>, res: Response): Promise<void>;
export { getMacrosFromDateRange, getTodaysMacros };
//# sourceMappingURL=macros.controller.d.ts.map