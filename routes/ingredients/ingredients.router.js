const express = require('express');

const {
    createNewIngredient,
    deleteIngredient,
    getIngredients,
} = require('./ingredients.controller');

const ingredientsRouter = express.Router();

ingredientsRouter.get('/', getIngredients);
ingredientsRouter.delete('/:ingredientId', deleteIngredient);
ingredientsRouter.post('/', createNewIngredient);

ingredientsRouter.get('/*', (req, res) => {
    res.status(404).send();
    return;
});

module.exports = ingredientsRouter;