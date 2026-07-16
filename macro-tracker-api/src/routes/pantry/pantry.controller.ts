import {
  exportPantry,
  importPantryReplace,
  parsePantryExport,
  PantryImportValidationError,
} from "../../models/pantry.model.js";
import { log, loggingLevels, formatResponse } from "../../Utilities/logger.js";
import type { Request, Response } from "express";
import type {
  GetPantryExportResponse,
  ImportPantryRequest,
  ImportPantryResponse,
} from "@macro-tracker/macro-tracker-shared";

async function getPantryExport(req: Request, res: Response) {
  try {
    const pantry = await exportPantry(req.session.userId!);
    const body: GetPantryExportResponse = pantry;
    res.status(200).send(JSON.stringify(body));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `getPantryExport: ${message}`, req.session.userId);
    res.status(500).send(formatResponse());
  }
}

async function postPantryImport(
  req: Request<unknown, unknown, ImportPantryRequest>,
  res: Response,
) {
  const body = req.body;
  const mode = body.mode ?? "replace";

  if (mode !== "replace") {
    res.status(400).send(
      JSON.stringify({ error: "Only mode 'replace' is supported" }),
    );
    return;
  }

  if (body.pantry === undefined) {
    res.status(400).send(
      JSON.stringify({ error: "Request must include a pantry payload" }),
    );
    return;
  }

  try {
    const pantry = parsePantryExport(body.pantry);
    const result = await importPantryReplace(req.session.userId!, pantry);
    const responseBody: ImportPantryResponse = result;
    res.status(200).send(JSON.stringify(responseBody));
  } catch (e) {
    if (e instanceof PantryImportValidationError) {
      res.status(400).send(JSON.stringify({ error: e.message }));
      return;
    }
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `postPantryImport: ${message}`, req.session.userId);
    res.status(500).send(formatResponse());
  }
}

export { getPantryExport, postPantryImport };
