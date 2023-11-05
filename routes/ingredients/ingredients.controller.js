const path = require('path');

const {
  createIngredientRaw,
  createIngredientFromComponents,
  deleteIngredientById,
  getIngredientsByUserId,
} = require('../../models/ingredients.model');

async function createNewIngredient(req, res) {
  if (!req.session.userid || !req.session.username) {
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

      const newIngredient = await createIngredientFromComponents(req.session.userid, req.body.components);

      res.status(201).send(JSON.stringify(newIngredient));

    } else if (req.body.ingredient && req.body.ingredient.name != '') {

      //make sure all names are populated (FOR BATCH VALIDATION)
      // if (req.body.ingredients.some(ingredient => ingredient.name == '')) {
      //   res.status(400).send(JSON.stringify({ error: "An ingredient name must be provided." }));
      //   return;
      // }

      const newIngredient = await createIngredientRaw(req.session.userid, req.body.ingredient);

      res.status(201).send(JSON.stringify(newIngredient));
      return;
    } else {
      res.status(400).send(JSON.stringify({ error: "Invalid Input" }));
    }
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `An error occured: ${e.message}` }));
    return;
  }
}

async function deleteIngredient(req, res) {
  if (!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    const result = await deleteIngredientById(req.session.userid,
      req.params.ingredientId);

    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
}

async function getIngredients(req, res) {
  if (!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    const result = await getIngredientsByUserId(req.session.userid);

    res.status(200)
      .send(JSON.stringify(result.rows));
  } catch (e) {
    res.status(400).send(e.message);
  }
}

module.exports = {
  createNewIngredient,
  deleteIngredient,
  getIngredients,
};