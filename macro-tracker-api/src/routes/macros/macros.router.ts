import express from "express";
import { getMacrosFromDateRange, getTodaysMacros } from "./macros.controller.js";

const macrosRouter = express.Router();

macrosRouter.get("/today", getTodaysMacros);
macrosRouter.get("/", getMacrosFromDateRange);

export default macrosRouter;
