import express from "express";
import { getPantryExport, postPantryImport } from "./pantry.controller.js";

const pantryRouter = express.Router();

pantryRouter.get("/export", getPantryExport);
pantryRouter.post("/import", postPantryImport);

export default pantryRouter;
