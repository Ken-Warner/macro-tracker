const {
  createIngredientRaw,
  createIngredientFromComponents,
  deleteIngredientById,
  getIngredientsByUserId,
} = require('../../models/ingredients.model');

const {
  log,
  loggingLevels,
  formatResponse
} = require('../../Utilities/logger');

const validator = require('../../Utilities/validator');

async function createNewIngredient(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    if (req.body.components && req.body.components.length > 0) {
      //ingredient is composed of other existing ingredients
      //all macro information is ignored and instead is tallied from the
      //existing ingredients
      if (req.body.components.some(component => component.ingredientId == 0) || req.body.components.some(component => component.portionSize == 0)) {
        res.status(400).send(JSON.stringify({ error: "Not all component IDs or portion sizes are provided" }));
        return;
      }

      const newIngredient = await createIngredientFromComponents(req.session.userId,
                                                                 req.body.ingredient.name,
                                                                 req.body.ingredient.description,
                                                                 req.body.components);

      res.status(201).send(JSON.stringify(newIngredient));

    } else if (req.body.ingredient && req.body.ingredient.name != '') {

      const newIngredient = await createIngredientRaw(req.session.userId, req.body.ingredient);

      res.status(201).send(JSON.stringify(newIngredient));
    } else {
      res.status(400).send(JSON.stringify({ error: "Invalid Input" }));
    }
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `createNewIngredient: ${e.message}`,
                            req.body);
    res.status(500).send(formatResponse(uuid));
  }
}

async function deleteIngredient(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  if (!validator.isNumberGEZero(req.params.ingredientId)) {
    res.status(400).send(JSON.stringify({ error: `A numeric ingredient ID must be provided.` }));
    return;
  }

  try {
    const result = await deleteIngredientById(req.session.userId,
                                              req.params.ingredientId);

    if (result == 0)
      await log (loggingLevels.INFO,
                 'deleteIngredient: ID not found.',
                 req.params);

    res.status(200).send();
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `deleteIngredient: ${e.message}`,
                            req.params);
    res.status(500).send(formatResponse(uuid));
  }
}

async function getIngredients(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    const result = await getIngredientsByUserId(req.session.userId);

    res.status(200).send(JSON.stringify(result.rows));
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `getIngredients: ${e.message}`,
                            req.session.userId);
    res.status(500).send(formatResponse(uuid));
  }
}

module.exports = {
  createNewIngredient,
  deleteIngredient,
  getIngredients,
};