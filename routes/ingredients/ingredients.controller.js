const path = require('path');

const {
    createIngredient,
    deleteIngredientById,
    getIngredientsByUserId,
} = require('../../models/ingredients.model');

async function createNewIngredient(req, res) {
  if (!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  //server side validations
  //determine which type of ingredient to create
    //one of other ingredients
    //or a raw ingredient

  try {

  } catch (e) {
    res.status(400).send(e.message);
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