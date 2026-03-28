import type { Request, Response } from "express";
import type { GetWeighInDataRequestQuery, PostWeighInDataRequest } from "@macro-tracker/macro-tracker-shared";
declare function getWeighInData(req: Request<unknown, unknown, unknown, Partial<GetWeighInDataRequestQuery>>, res: Response): Promise<void>;
declare function getRecentWeighInData(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function postWeighInData(req: Request<unknown, unknown, PostWeighInDataRequest>, res: Response): Promise<void>;
export { getWeighInData, getRecentWeighInData, postWeighInData };
//# sourceMappingURL=weighIn.controller.d.ts.map