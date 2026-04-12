import express from "express";
import { getWeighInData, getRecentWeighInData, postWeighInData, } from "./weighIn.controller.js";
const weighInRouter = express.Router();
weighInRouter.post("/", postWeighInData);
weighInRouter.get("/recent", getRecentWeighInData);
weighInRouter.get("/", getWeighInData);
export default weighInRouter;
//# sourceMappingURL=weighIn.router.js.map