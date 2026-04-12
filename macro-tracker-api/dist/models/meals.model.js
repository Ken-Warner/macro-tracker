import { Meal, } from "@macro-tracker/macro-tracker-shared";
import { query, buildInsert, DEFAULT } from "./pool.js";
export async function createMeal(userId, meal) {
    const getIngredientsQuery = {
        text: `SELECT id, calories, protein, carbohydrates, fats
            FROM ingredients
            WHERE user_id = $1
              AND id IN (${meal.ingredients
            .map((_, idx) => "$" + String(idx + 2))
            .join(",")});`,
        params: [
            userId,
            ...meal.ingredients.map((ingredient) => ingredient.ingredientId),
        ],
    };
    const mealRecipe = [];
    const ingredientsResult = await query(getIngredientsQuery);
    if (ingredientsResult.rowCount === null || ingredientsResult.rowCount <= 0) {
        throw new Error("No results for provided Ingredients.");
    }
    const newMeal = {
        name: meal.name,
        description: meal.description,
        date: meal.date,
        time: meal.time,
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fats: 0,
    };
    for (const ingredient of ingredientsResult.rows) {
        const portionSize = meal.ingredients.find((el) => el.ingredientId === ingredient.id)?.portionSize;
        if (portionSize === undefined) {
            throw new Error("No results for provided Ingredients.");
        }
        mealRecipe.push({
            ingredientId: ingredient.id,
            portionSize,
        });
        newMeal.calories += ingredient.calories * portionSize;
        newMeal.protein += ingredient.protein * portionSize;
        newMeal.carbohydrates += ingredient.carbohydrates * portionSize;
        newMeal.fats += ingredient.fats * portionSize;
    }
    const finalNewMeal = await createMealRaw(userId, newMeal);
    const mealId = finalNewMeal.id;
    if (mealId === undefined) {
        throw new Error("Meal insert did not return an id");
    }
    for (const component of mealRecipe) {
        component.mealId = mealId;
    }
    await insertMealRecipe(mealRecipe);
    return finalNewMeal;
}
export async function createMealRaw(userId, meal) {
    const normalized = {
        name: meal.name,
        description: meal.description,
        date: meal.date,
        time: meal.time,
        calories: (meal.calories || -1) < 0 ? 0 : (meal.calories ?? 0),
        protein: (meal.protein || -1) < 0 ? 0 : (meal.protein ?? 0),
        carbohydrates: (meal.carbohydrates || -1) < 0 ? 0 : (meal.carbohydrates ?? 0),
        fats: (meal.fats || -1) < 0 ? 0 : (meal.fats ?? 0),
    };
    const fields = [
        "user_id",
        "name",
        "description",
        "date",
        "time",
        "calories",
        "protein",
        "carbohydrates",
        "fats",
    ];
    const values = [
        userId,
        normalized.name,
        normalized.description,
        normalized.date ?? DEFAULT,
        normalized.time ?? DEFAULT,
        normalized.calories,
        normalized.protein,
        normalized.carbohydrates,
        normalized.fats,
    ];
    const [queryFields, queryValues, queryParams] = buildInsert(fields, values);
    const createMealQuery = {
        text: `INSERT INTO meals ${queryFields}
            VALUES ${queryValues}
            RETURNING *;`,
        params: queryParams,
    };
    const result = await query(createMealQuery);
    const row = result.rows[0];
    const mealEntity = Meal.fromDbRow(row);
    await updateMacroTotals(userId, {
        date: mealEntity.date,
        calories: mealEntity.calories,
        protein: mealEntity.protein,
        carbohydrates: mealEntity.carbohydrates,
        fats: mealEntity.fats,
    });
    return mealEntity;
}
export async function getMealsFromDay(userId, daysAgo) {
    const getMealsQuery = {
        text: `SELECT *
            FROM meals
            WHERE user_id = $1
            AND (current_date - date) = $2;`,
        params: [userId, daysAgo],
    };
    try {
        const result = await query(getMealsQuery);
        return result.rows.map((row) => Meal.fromDbRow(row));
    }
    catch {
        throw new Error("Invalid Query");
    }
}
export async function deleteMeal(userId, mealId) {
    const deleteMealQuery = {
        text: `DELETE FROM meals
            WHERE user_id = $1
              AND id = $2
            RETURNING *;`,
        params: [userId, mealId],
    };
    const result = await query(deleteMealQuery);
    if (result.rowCount === 1) {
        const deletedRow = result.rows[0];
        const deletedMeal = Meal.fromDbRow(deletedRow);
        await updateMacroTotals(userId, {
            date: deletedMeal.date,
            calories: -deletedMeal.calories,
            protein: -deletedMeal.protein,
            carbohydrates: -deletedMeal.carbohydrates,
            fats: -deletedMeal.fats,
        });
    }
}
export async function getMealHistoryWithRange(userId, fromDate, toDate) {
    const getMealHistoryQuery = {
        text: `SELECT id,
                  name,
                  description,
                  date,
                  time,
                  calories,
                  protein,
                  carbohydrates,
                  fats,
                  is_recurring
            FROM meals
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3
            ORDER BY date DESC;`,
        params: [userId, fromDate, toDate],
    };
    const result = await query(getMealHistoryQuery);
    return result.rows.map((row) => Meal.fromDbRow(row));
}
async function insertMealRecipe(mealRecipe) {
    const mealRecipeQuery = {
        text: `INSERT INTO meal_ingredients (meal_id, ingredient_id, portion_size)
            VALUES ${mealRecipe
            .map((_, idx) => {
            const firstIdx = 3 * idx + 1;
            return `($${String(firstIdx)},$${String(firstIdx + 1)},$${String(firstIdx + 2)})`;
        })
            .join(",")};`,
        params: mealRecipe.flatMap((el) => {
            if (el.mealId === undefined) {
                throw new Error("mealId required for meal_ingredients insert");
            }
            return [el.mealId, el.ingredientId, el.portionSize];
        }),
    };
    return await query(mealRecipeQuery);
}
async function updateMacroTotals(userId, meal) {
    const getMacroTotalsQuery = {
        text: `SELECT date, calories, protein, carbohydrates, fats
            FROM macro_totals
            WHERE user_id = $1
              AND date = $2;`,
        params: [userId, meal.date],
    };
    const existing = await query(getMacroTotalsQuery);
    let upsertQuery;
    if (existing.rowCount === 1) {
        const macroTotals = existing.rows[0];
        macroTotals.calories += meal.calories;
        macroTotals.protein += meal.protein;
        macroTotals.carbohydrates += meal.carbohydrates;
        macroTotals.fats += meal.fats;
        upsertQuery = {
            text: `UPDATE macro_totals
              SET (calories, protein, carbohydrates, fats)
                = ($1, $2, $3, $4)
              WHERE user_id = $5
                AND date = $6;`,
            params: [
                macroTotals.calories,
                macroTotals.protein,
                macroTotals.carbohydrates,
                macroTotals.fats,
                userId,
                macroTotals.date.toISOString().split("T")[0],
            ],
        };
    }
    else {
        upsertQuery = {
            text: `INSERT INTO macro_totals (user_id, date, calories, protein, carbohydrates, fats)
              VALUES ($1, $2, $3, $4, $5, $6);`,
            params: [
                userId,
                meal.date,
                meal.calories,
                meal.protein,
                meal.carbohydrates,
                meal.fats,
            ],
        };
    }
    await query(upsertQuery);
}
export async function updateMealIsRecurring(mealId, userId, isRecurring) {
    const updateQuery = {
        text: `UPDATE meals
            SET is_recurring = $1
            WHERE id = $2
              AND user_id = $3;`,
        params: [isRecurring, mealId, userId],
    };
    const result = await query(updateQuery);
    return result.rowCount ?? 0;
}
export async function selectRecurringMeals(userId) {
    const selectQuery = {
        text: `SELECT name,
                  description,
                  date,
                  time,
                  calories,
                  protein,
                  carbohydrates,
                  fats
            FROM meals AS outer_meals
            WHERE NOT EXISTS (SELECT id
                                FROM meals AS inner_meals
                                WHERE inner_meals.date > outer_meals.date
                                  AND inner_meals.user_id = $1)
            AND outer_meals.user_id = $1;`,
        params: [userId],
    };
    const result = await query(selectQuery);
    return result.rows.map((row) => Meal.fromPartialRow(row));
}
export async function insertMealsFromRecurringUpdate(newMeals, newMacroTotals) {
    let mealsValues = "";
    const mealsParams = [];
    let counter = 1;
    for (const meal of newMeals) {
        mealsValues += ` ($${String(counter++)}, $${String(counter++)}, $${String(counter++)}, $${String(counter++)}, $${String(counter++)}, 
                $${String(counter++)}, $${String(counter++)}, $${String(counter++)}, $${String(counter++)}, $${String(counter++)}),`;
        mealsParams.push(meal.userId, meal.name, meal.description, meal.date, meal.time, meal.calories, meal.protein, meal.carbohydrates, meal.fats, meal.isRecurring);
    }
    mealsValues = mealsValues.slice(0, mealsValues.length - 1);
    const insertMealsQuery = {
        text: `INSERT INTO meals
            (user_id, name, description, date, time, calories, protein, carbohydrates, fats, is_recurring)
            VALUES${mealsValues};`,
        params: mealsParams,
    };
    await query(insertMealsQuery);
    let macrosValues = "";
    const macrosParams = [];
    counter = 1;
    for (const macros of newMacroTotals) {
        macrosValues += ` ($${String(counter++)}, $${String(counter++)}, $${String(counter++)}, 
                      $${String(counter++)}, $${String(counter++)}, $${String(counter++)}),`;
        macrosParams.push(macros.userId, macros.date, macros.calories, macros.protein, macros.carbohydrates, macros.fats);
    }
    macrosValues = macrosValues.slice(0, macrosValues.length - 1);
    const insertMacrosQuery = {
        text: `INSERT INTO macro_totals 
            (user_id, date, calories, protein, carbohydrates, fats) 
            VALUES${macrosValues};`,
        params: macrosParams,
    };
    await query(insertMacrosQuery);
}
//# sourceMappingURL=meals.model.js.map