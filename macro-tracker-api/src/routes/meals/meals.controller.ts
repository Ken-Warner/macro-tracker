import {
  createMeal,
  createMealRaw,
  getMealsFromDay,
  getMealHistoryWithRange,
  deleteMeal,
  updateMealIsRecurring,
  selectRecurringMeals,
  insertMealsFromRecurringUpdate,
} from "../../models/meals.model.js";
import validator from "../../Utilities/validator.js";
import { log, loggingLevels, formatResponse } from "../../Utilities/logger.js";
import type { Request, Response } from "express";
import type {
  CreateComposedMealRequest,
  CreateComposedMealResponse,
  CreateMealRawRequest,
  CreateMealRawResponse,
  GetMealHistoryRequestQuery,
  GetMealHistoryResponse,
  GetMealsRequestQuery,
  GetMealsResponse,
  MealHistoryMeal,
  PutMealIsRecurringRequest,
} from "@macro-tracker/macro-tracker-shared";

type RecurringMealRow = {
  name: string;
  description: string | null;
  date: Date;
  time: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

async function createNewMeal(
  req: Request<unknown, unknown, CreateComposedMealRequest>,
  res: Response,
) {
  const meal = req.body;

  if (!meal.name) {
    res
      .status(400)
      .send(JSON.stringify({ error: "You must provide a meal name" }));
    return;
  }
  if (!meal.ingredients || meal.ingredients.length < 1) {
    res
      .status(400)
      .send(
        JSON.stringify({ error: "You must provide at least one ingredient" }),
      );
    return;
  }
  if (
    !meal.ingredients ||
    meal.ingredients.some((ingredient) => ingredient.ingredientId <= 0)
  ) {
    res
      .status(400)
      .send(
        JSON.stringify({ error: "1 or more of the ingredient IDs is invalid" }),
      );
    return;
  }
  if (
    !meal.ingredients ||
    meal.ingredients.some((ingredient) => ingredient.portionSize <= 0)
  ) {
    res.status(400).send(
      JSON.stringify({
        error: "1 or more of the ingredients portion sizes are invalid",
      }),
    );
    return;
  }

  try {
    const newMeal = (await createMeal(
      req.session.userId,
      meal,
    )) as CreateComposedMealResponse;

    res.status(201).send(JSON.stringify(newMeal));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const uuid = await log(
      loggingLevels.ERROR,
      `createNewMeal: ${message}`,
      req.body,
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function createNewMealRaw(
  req: Request<unknown, unknown, CreateMealRawRequest>,
  res: Response,
) {
  try {
    if (!req.body.name) {
      res
        .status(400)
        .send(JSON.stringify({ error: `You must provide a meal name.` }));
      return;
    }

    const rawInput = {
      name: req.body.name,
      description: req.body.description,
      calories: (req.body.calories || -1) < 0 ? 0 : req.body.calories,
      protein: (req.body.protein || -1) < 0 ? 0 : req.body.protein,
      carbohydrates:
        (req.body.carbohydrates || -1) < 0 ? 0 : req.body.carbohydrates,
      fats: (req.body.fats || -1) < 0 ? 0 : req.body.fats,
      date: req.body.date,
      time: req.body.time,
    };

    const newMeal = await createMealRaw(req.session.userId, rawInput);

    const responseMeal: CreateMealRawResponse = {
      id: newMeal.id,
      name: newMeal.name,
      description: newMeal.description,
      calories: newMeal.calories,
      protein: newMeal.protein,
      carbohydrates: newMeal.carbohydrates,
      fats: newMeal.fats,
      date: newMeal.date,
      time: newMeal.time,
    };

    res.status(201).send(JSON.stringify(responseMeal));
  } catch (e) {
    console.log(e);
    const message = e instanceof Error ? e.message : String(e);
    const uuid = await log(
      loggingLevels.ERROR,
      `createNewMealRaw: ${message}`,
      req.body,
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function getMealHistory(
  req: Request<unknown, unknown, unknown, Partial<GetMealHistoryRequestQuery>>,
  res: Response,
) {
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  if (
    !fromDate ||
    !toDate ||
    !validator.isValidDate(fromDate) ||
    !validator.isValidDate(toDate)
  ) {
    res.status(400).send(
      JSON.stringify({
        error:
          "You must provide a date range with values fromDate and toDate in the format YYYY-MM-DD",
      }),
    );
    return;
  }

  try {
    const mealHistoryWithoutRecurring = await getMealHistoryWithRange(
      req.session.userId,
      fromDate,
      toDate,
    );

    let newMeals: unknown[] = [];
    let newMacroTotals: unknown[] = [];

    if (
      (mealHistoryWithoutRecurring.length > 0 &&
        mealHistoryWithoutRecurring[0].date.toISOString().split("T")[0] !==
          toDate) ||
      mealHistoryWithoutRecurring.length === 0
    ) {
      const recurringMeals = await selectRecurringMeals(req.session.userId);
      if (recurringMeals.length > 0) {
        const recurringMacroTotals = recurringMeals.reduce(
          (
            acc: {
              calories: number;
              protein: number;
              carbohydrates: number;
              fats: number;
            },
            curr: {
              calories: number;
              protein: number;
              carbohydrates: number;
              fats: number;
            },
          ) => {
            acc.calories += curr.calories;
            acc.protein += curr.protein;
            acc.carbohydrates += curr.carbohydrates;
            acc.fats += curr.fats;

            return acc;
          },
          {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fats: 0,
          },
        );

        const toDateObj = new Date(toDate + "T00:00:00");
        let currentDate = new Date(recurringMeals[0].date);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate <= toDateObj) {
          newMeals.push(
            ...recurringMeals.map((recurringMeal: RecurringMealRow) => {
              return {
                ...recurringMeal,
                date: new Date(currentDate),
                userId: req.session.userId,
                isRecurring: true,
              };
            }),
          );
          newMacroTotals.push({
            ...recurringMacroTotals,
            date: new Date(currentDate),
            userId: req.session.userId,
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        await insertMealsFromRecurringUpdate(newMeals, newMacroTotals);
      }
    }

    const mealHistory = [...newMeals.reverse(), ...mealHistoryWithoutRecurring];

    const deepMealHistory: GetMealHistoryResponse = [];
    for (const meal of mealHistory) {
      type MealWithDate = { date: Date | string } & Record<string, unknown>;
      const m = meal as MealWithDate;
      const mealsDate =
        m.date instanceof Date
          ? (m.date.toISOString().split("T")[0] ?? "")
          : typeof m.date === "string"
            ? m.date
            : "";
      m.date = mealsDate;

      const historyMeal = m as unknown as MealHistoryMeal;

      const existingGroup = deepMealHistory.find(
        (el) => el.mealsDate === mealsDate,
      );

      if (existingGroup) {
        existingGroup.meals.push(historyMeal);
      } else {
        deepMealHistory.push({ mealsDate, meals: [historyMeal] });
      }
    }

    res.status(200).send(JSON.stringify(deepMealHistory));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const uuid = await log(
      loggingLevels.ERROR,
      `getMealHistory: ${message}`,
      req.query,
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function getMeals(
  req: Request<unknown, unknown, unknown, Partial<GetMealsRequestQuery>>,
  res: Response,
) {
  const daysAgo = Number(req.query.daysAgo) || 0;

  if (!validator.isNumberGEZero(daysAgo)) {
    res.status(400).send(
      JSON.stringify({
        error:
          "You must provide a numerical offset, day greater than 0, from today as daysAgo",
      }),
    );
    return;
  }

  try {
    const meals = (await getMealsFromDay(
      req.session.userId,
      daysAgo,
    )) as GetMealsResponse;

    res.status(200).send(JSON.stringify(meals));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const uuid = await log(
      loggingLevels.ERROR,
      `getMeals: ${message}`,
      req.query,
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function deleteMealById(
  req: Request<{ id: string }, unknown, unknown, unknown>,
  res: Response,
) {
  if (!validator.isNumberGEZero(Number(req.params.id))) {
    res
      .status(400)
      .send(JSON.stringify({ error: `A numeric meal ID must be provided.` }));
    return;
  }

  try {
    await deleteMeal(req.session.userId, req.params.id);

    res.status(200).send();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const uuid = await log(
      loggingLevels.ERROR,
      `deleteMealById: ${message}`,
      { userId: req.session.userId, requestParamaters: req.params },
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function putMealIsRecurring(
  req: Request<{ id: string }, unknown, PutMealIsRecurringRequest>,
  res: Response,
) {
  try {
    const result = await updateMealIsRecurring(
      req.params.id,
      req.session.userId,
      req.body.isRecurring,
    );

    res.status(result === 1 ? 200 : 404).send();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const uuid = await log(
      loggingLevels.ERROR,
      `putMealIsRecurring: ${message}`,
      { userId: req.session.userId, requestParamaters: req.params },
    );
    res.status(500).send(formatResponse(uuid));
  }
}

export {
  createNewMeal,
  createNewMealRaw,
  getMealHistory,
  getMeals,
  deleteMealById,
  putMealIsRecurring,
};
