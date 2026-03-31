import { createIngredientRaw, createIngredientFromComponents, deleteIngredientById, getIngredientsByUserId, } from "../../models/ingredients.model.js";
import { log, loggingLevels, formatResponse } from "../../Utilities/logger.js";
import validator from "../../Utilities/validator.js";
async function createNewIngredient(req, res) {
    try {
        if (req.body.components && req.body.components.length > 0) {
            //ingredient is composed of other existing ingredients
            //all macro information is ignored and instead is tallied from the
            //existing ingredients
            if (req.body.components.some((component) => component.ingredientId == 0) ||
                req.body.components.some((component) => component.portionSize == 0)) {
                res
                    .status(400)
                    .send(JSON.stringify({
                    error: "Not all component IDs or portion sizes are provided",
                }));
                return;
            }
            const newIngredient = await createIngredientFromComponents(req.session.userId, req.body.ingredient.name, req.body.ingredient.description, req.body.components);
            const body = newIngredient;
            res.status(201).send(JSON.stringify(body));
        }
        else if (req.body.ingredient && req.body.ingredient.name != "") {
            const newIngredient = await createIngredientRaw(req.session.userId, req.body.ingredient);
            const body = newIngredient;
            res.status(201).send(JSON.stringify(body));
        }
        else {
            res.status(400).send(JSON.stringify({ error: "Invalid Input" }));
        }
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const uuid = await log(loggingLevels.ERROR, `createNewIngredient: ${message}`, req.body);
        res.status(500).send(formatResponse(uuid));
    }
}
async function deleteIngredient(req, res) {
    const ingredientIdNum = Number(req.params.ingredientId);
    if (!validator.isNumberGEZero(ingredientIdNum)) {
        res
            .status(400)
            .send(JSON.stringify({
            error: `A numeric ingredient ID must be provided.`,
        }));
        return;
    }
    try {
        const result = await deleteIngredientById(req.session.userId, ingredientIdNum);
        if (result == 0)
            await log(loggingLevels.INFO, "deleteIngredient: ID not found.", req.params);
        res.status(200).send();
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const uuid = await log(loggingLevels.ERROR, `deleteIngredient: ${message}`, req.params);
        res.status(500).send(formatResponse(uuid));
    }
}
async function getIngredients(req, res) {
    try {
        const result = await getIngredientsByUserId(req.session.userId);
        const body = result.rows;
        res.status(200).send(JSON.stringify(body));
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const uuid = await log(loggingLevels.ERROR, `getIngredients: ${message}`, req.session.userId);
        res.status(500).send(formatResponse(uuid));
    }
}
export { createNewIngredient, deleteIngredient, getIngredients };
//# sourceMappingURL=ingredients.controller.js.map