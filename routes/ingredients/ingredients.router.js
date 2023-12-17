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

module.exports = ingredientsRouter;