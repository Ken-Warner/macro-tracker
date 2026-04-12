import type { Request, Response } from "express";
import type { UserCreateRequest, UserLoginRequest } from "@macro-tracker/macro-tracker-shared";
declare function createNewUser(req: Request<{}, {}, UserCreateRequest>, res: Response): Promise<void>;
declare function logUserIn(req: Request<{}, {}, UserLoginRequest>, res: Response): Promise<void>;
declare function logUserOut(req: Request, res: Response): void;
export { logUserIn, logUserOut, createNewUser };
//# sourceMappingURL=users.controller.d.ts.map