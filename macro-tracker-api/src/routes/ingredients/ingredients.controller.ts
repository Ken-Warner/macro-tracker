import {
  createIngredient,
  deleteIngredientById,
  getIngredientsByUserId,
} from "../../models/ingredients.model.js";
import { IngredientInUseError } from "../../errors/IngredientInUseError.js";
import { log, loggingLevels, formatResponse } from "../../Utilities/logger.js";
import validator from "../../Utilities/validator.js";
import {
  IngredientImageValidationError,
  processIngredientImageWithTesseract,
  validateIngredientImageBuffer,
} from "../../Utilities/ingredientImage.js";
import { isIngredientOcrEnabled } from "../../Utilities/featureFlags.js";
import type { Request, Response } from "express";
import type {
  CreateIngredientResponse,
  CreateNewIngredientRequest,
  DeleteIngredientRequestParams,
  GetIngredientsResponse,
  GetIngredientFromImageResponse,
} from "@macro-tracker/macro-tracker-shared";

async function createNewIngredient(
  req: Request<unknown, unknown, CreateNewIngredientRequest>,
  res: Response,
) {
  try {
    if (!req.body.ingredient || req.body.ingredient.name === "") {
      return res.status(400).send(JSON.stringify({ error: "Invalid Input" }));
    }
    const newIngredient = await createIngredient(
      req.session.userId!,
      req.body.ingredient,
    );

    if (!newIngredient) {
      log(
        loggingLevels.ERROR,
        "createNewIngredient: insert returned no row",
        req.body,
      );
      res.status(500).send(formatResponse());
      return;
    }

    const body: CreateIngredientResponse = newIngredient.toJSON();
    res.status(201).send(JSON.stringify(body));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `createNewIngredient: ${message}`, req.body);
    res.status(500).send(formatResponse());
  }
}

async function deleteIngredient(
  req: Request<DeleteIngredientRequestParams>,
  res: Response,
) {
  const ingredientIdNum = Number(req.params.ingredientId);
  if (!validator.isNumberGEZero(ingredientIdNum)) {
    res.status(400).send(
      JSON.stringify({
        error: `A numeric ingredient ID must be provided.`,
      }),
    );
    return;
  }

  try {
    const result = await deleteIngredientById(
      req.session.userId!,
      ingredientIdNum,
    );

    if (result == 0)
      log(loggingLevels.INFO, "deleteIngredient: ID not found.", req.params);

    res.status(200).send();
  } catch (e) {
    if (e instanceof IngredientInUseError) {
      res.status(409).send(JSON.stringify({ error: e.message }));
      return;
    }
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `deleteIngredient: ${message}`, req.params);
    res.status(500).send(formatResponse());
  }
}

async function getIngredients(req: Request, res: Response) {
  try {
    const result = await getIngredientsByUserId(req.session.userId!);

    const body: GetIngredientsResponse = result.map((row) => row.toJSON());
    res.status(200).send(JSON.stringify(body));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `getIngredients: ${message}`, req.session.userId);
    res.status(500).send(formatResponse());
  }
}

async function getIngredientFromImage(req: Request, res: Response) {
  if (!isIngredientOcrEnabled()) {
    res
      .status(403)
      .send(JSON.stringify({ error: "Ingredient OCR is disabled." }));
    return;
  }

  try {
    const file = req.file;
    if (!file) {
      res
        .status(400)
        .send(JSON.stringify({ error: "An image file is required." }));
      return;
    }

    const validated = await validateIngredientImageBuffer(
      file.buffer,
      file.mimetype,
    );

    const result = await processIngredientImageWithTesseract(file.buffer);

    const body: GetIngredientFromImageResponse = result;

    res.status(200).send(JSON.stringify(body));
  } catch (e) {
    if (e instanceof IngredientImageValidationError) {
      res.status(400).send(JSON.stringify({ error: e.message }));
      return;
    }
    const message = e instanceof Error ? e.message : String(e);
    log(
      loggingLevels.ERROR,
      `getIngredientFromImage: ${message}`,
      req.session.userId,
    );
    res.status(500).send(formatResponse());
  }
}

export {
  createNewIngredient,
  deleteIngredient,
  getIngredients,
  getIngredientFromImage,
};
