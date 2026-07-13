import {
  createRecipe,
  deleteRecipeById,
  getRecipesByUserId,
  getRecipeById,
  patchRecipe,
  resetRecipeAmounts,
} from "../../models/recipes.model.js";
import { log, loggingLevels, formatResponse } from "../../Utilities/logger.js";
import validator from "../../Utilities/validator.js";
import type { Request, Response } from "express";
import type {
  CreateRecipeRequest,
  CreateRecipeResponse,
  GetRecipesResponse,
  PatchRecipeRequest,
  PatchRecipeResponse,
  RecipeIdParams,
  ResetRecipeResponse,
} from "@macro-tracker/macro-tracker-shared";

async function getRecipes(req: Request, res: Response) {
  try {
    const result = await getRecipesByUserId(req.session.userId!);
    const body: GetRecipesResponse = result.map((row) => row.toJSON());
    res.status(200).send(JSON.stringify(body));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `getRecipes: ${message}`, req.session.userId);
    res.status(500).send(formatResponse());
  }
}

async function createNewRecipe(
  req: Request<unknown, unknown, CreateRecipeRequest>,
  res: Response,
) {
  const body = req.body;

  if (!body.name || String(body.name).trim() === "") {
    res.status(400).send(JSON.stringify({ error: "You must provide a recipe name" }));
    return;
  }

  if (
    body.divisionMode !== "portions" &&
    body.divisionMode !== "per_ounce"
  ) {
    res.status(400).send(
      JSON.stringify({
        error: "divisionMode must be 'portions' or 'per_ounce'",
      }),
    );
    return;
  }

  if (
    body.divisionMode === "portions" &&
    (!body.portionCount || body.portionCount <= 0)
  ) {
    res.status(400).send(
      JSON.stringify({
        error: "portionCount must be greater than 0 for portioned recipes",
      }),
    );
    return;
  }

  if (
    body.divisionMode === "per_ounce" &&
    (!body.totalYieldOz || body.totalYieldOz <= 0)
  ) {
    res.status(400).send(
      JSON.stringify({
        error: "totalYieldOz must be greater than 0 for per-ounce recipes",
      }),
    );
    return;
  }

  if (!body.ingredients || body.ingredients.length < 1) {
    res.status(400).send(
      JSON.stringify({ error: "You must provide at least one ingredient" }),
    );
    return;
  }

  if (
    body.ingredients.some(
      (line) =>
        !line.ingredientId ||
        line.ingredientId <= 0 ||
        !line.defaultAmount ||
        line.defaultAmount <= 0,
    )
  ) {
    res.status(400).send(
      JSON.stringify({
        error: "Each ingredient needs a valid id and defaultAmount > 0",
      }),
    );
    return;
  }

  try {
    const createPayload: CreateRecipeRequest = {
      name: String(body.name).trim(),
      divisionMode: body.divisionMode,
      ingredients: body.ingredients,
    };
    if (body.description !== undefined) {
      createPayload.description = body.description;
    }
    if (body.divisionMode === "portions" && body.portionCount !== undefined) {
      createPayload.portionCount = body.portionCount;
    }
    if (body.divisionMode === "per_ounce" && body.totalYieldOz !== undefined) {
      createPayload.totalYieldOz = body.totalYieldOz;
    }

    const recipe = await createRecipe(req.session.userId!, createPayload);

    const responseBody: CreateRecipeResponse = recipe.toJSON();
    res.status(201).send(JSON.stringify(responseBody));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `createNewRecipe: ${message}`, req.body);
    if (
      message.includes("not found") ||
      message.includes("Duplicate ingredients")
    ) {
      res.status(400).send(JSON.stringify({ error: message }));
      return;
    }
    res.status(500).send(formatResponse());
  }
}

async function patchRecipeById(
  req: Request<RecipeIdParams, unknown, PatchRecipeRequest>,
  res: Response,
) {
  const recipeIdNum = Number(req.params.recipeId);
  if (!validator.isNumberGEZero(recipeIdNum) || recipeIdNum <= 0) {
    res.status(400).send(
      JSON.stringify({ error: "A numeric recipe ID must be provided." }),
    );
    return;
  }

  const body = req.body;
  if (
    body.totalYieldOz === undefined &&
    (!body.ingredients || body.ingredients.length === 0)
  ) {
    res.status(400).send(
      JSON.stringify({
        error: "Provide totalYieldOz and/or ingredient current amounts to update",
      }),
    );
    return;
  }

  if (body.totalYieldOz !== undefined && body.totalYieldOz <= 0) {
    res.status(400).send(
      JSON.stringify({ error: "totalYieldOz must be greater than 0" }),
    );
    return;
  }

  if (
    body.ingredients &&
    body.ingredients.some(
      (line) =>
        !line.ingredientId ||
        line.ingredientId <= 0 ||
        !line.currentAmount ||
        line.currentAmount <= 0,
    )
  ) {
    res.status(400).send(
      JSON.stringify({
        error: "Each ingredient needs a valid id and currentAmount > 0",
      }),
    );
    return;
  }

  try {
    const existing = await getRecipeById(req.session.userId!, recipeIdNum);
    if (!existing) {
      res.status(404).send(JSON.stringify({ error: "Recipe not found" }));
      return;
    }

    if (
      body.totalYieldOz !== undefined &&
      existing.divisionMode !== "per_ounce"
    ) {
      res.status(400).send(
        JSON.stringify({
          error: "totalYieldOz can only be updated on per-ounce recipes",
        }),
      );
      return;
    }

    const recipe = await patchRecipe(req.session.userId!, recipeIdNum, body);
    if (!recipe) {
      res.status(404).send(JSON.stringify({ error: "Recipe not found" }));
      return;
    }

    const responseBody: PatchRecipeResponse = recipe.toJSON();
    res.status(200).send(JSON.stringify(responseBody));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `patchRecipeById: ${message}`, req.body);
    if (message.includes("Cannot add or change ingredients")) {
      res.status(400).send(JSON.stringify({ error: message }));
      return;
    }
    res.status(500).send(formatResponse());
  }
}

async function resetRecipeById(req: Request<RecipeIdParams>, res: Response) {
  const recipeIdNum = Number(req.params.recipeId);
  if (!validator.isNumberGEZero(recipeIdNum) || recipeIdNum <= 0) {
    res.status(400).send(
      JSON.stringify({ error: "A numeric recipe ID must be provided." }),
    );
    return;
  }

  try {
    const recipe = await resetRecipeAmounts(req.session.userId!, recipeIdNum);
    if (!recipe) {
      res.status(404).send(JSON.stringify({ error: "Recipe not found" }));
      return;
    }

    const responseBody: ResetRecipeResponse = recipe.toJSON();
    res.status(200).send(JSON.stringify(responseBody));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `resetRecipeById: ${message}`, req.params);
    res.status(500).send(formatResponse());
  }
}

async function deleteRecipe(req: Request<RecipeIdParams>, res: Response) {
  const recipeIdNum = Number(req.params.recipeId);
  if (!validator.isNumberGEZero(recipeIdNum) || recipeIdNum <= 0) {
    res.status(400).send(
      JSON.stringify({ error: "A numeric recipe ID must be provided." }),
    );
    return;
  }

  try {
    const result = await deleteRecipeById(req.session.userId!, recipeIdNum);
    if (result === 0) {
      res.status(404).send(JSON.stringify({ error: "Recipe not found" }));
      return;
    }
    res.status(200).send();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log(loggingLevels.ERROR, `deleteRecipe: ${message}`, req.params);
    res.status(500).send(formatResponse());
  }
}

export {
  getRecipes,
  createNewRecipe,
  patchRecipeById,
  resetRecipeById,
  deleteRecipe,
};
