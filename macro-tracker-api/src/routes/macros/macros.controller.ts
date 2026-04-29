import {
  selectMacrosFromDateRange,
  selectTodaysMacros,
} from "../../models/macros.model.js";
import validator from "../../Utilities/validator.js";
import { log, loggingLevels, formatResponse } from "../../Utilities/logger.js";
import type { Request, Response } from "express";

export async function getMacrosFromDateRange(
  req: Request<
    unknown,
    unknown,
    unknown,
    Partial<{ fromDate: string; toDate: string }>
  >,
  res: Response,
) {
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  if (!fromDate || !validator.isValidDate(fromDate)) {
    res.status(400).send(
      JSON.stringify({
        error: `You must provide a fromDate in the format YYYY-MM-DD`,
      }),
    );
    return;
  }

  if (!toDate || !validator.isValidDate(toDate)) {
    res.status(400).send(
      JSON.stringify({
        error: `You must provide a toDate in the format YYYY-MM-DD`,
      }),
    );
    return;
  }

  try {
    const macroData = await selectMacrosFromDateRange(
      req.session.userId!,
      fromDate,
      toDate,
    );

    res.status(200).send(JSON.stringify(macroData));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const uuid = await log(
      loggingLevels.ERROR,
      `getMacrosFromDateRange: ${message}`,
      req.query,
    );
    res.status(500).send(formatResponse(uuid));
  }
}

export async function getTodaysMacros(
  req: Request<unknown, unknown, unknown, Partial<{ today: string }>>,
  res: Response,
) {
  if (!req.query.today || !validator.isValidDate(req.query.today)) {
    res.status(400).send(
      JSON.stringify({
        error: `You must provide a date in the format YYYY-MM-DD`,
      }),
    );
    return;
  }

  try {
    const todaysMacros = await selectTodaysMacros(
      req.session.userId!,
      req.query.today,
    );

    if (todaysMacros.date === undefined) {
      todaysMacros.date = req.query.today;
    }

    res.status(200).send(JSON.stringify(todaysMacros));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const uuid = await log(
      loggingLevels.ERROR,
      `getTodaysMacros: ${message}`,
      req.query,
    );
    res.status(500).send(formatResponse(uuid));
  }
}
