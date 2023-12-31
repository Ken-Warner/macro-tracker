const { query } = require('./pool');

async function createIngredientRaw(userId, ingredient) {
  let createIngredientQuery = {
    text: `INSERT INTO ingredients
            (user_id, name, description, calories, protein, carbohydrates, fats)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;`,
    params: [
      userId,
      ingredient.name,
      ingredient.description || '',
      ingredient.calories || 0,
      ingredient.protein || 0,
      ingredient.carbohydrates || 0,
      ingredient.fats || 0,
    ],
  };

  const result = await query(createIngredientQuery);

  if (result.rowCount == 1)
    return result.rows[0];
}

async function createIngredientFromComponents(userId, name, description, components) {
  //select all components with the provided ids
  let getComponentsQuery = {
    text: `SELECT id, calories, protein, carbohydrates, fats
            FROM ingredients
            WHERE user_id = $1
            AND id IN (${components.map((component, idx) => '$' + (idx + 2)).join(',')});`,
    params: [
      userId,
      ...components.map(component => component.ingredientId),
    ],
  };

  let newIngredient = {};
  let componentsForNewIngredient;
  let recipeAssociations = new Array();

  componentsForNewIngredient = await query(getComponentsQuery);

  if (componentsForNewIngredient.rowCount != components.length)
    throw new Error('Ingredient not retrieved with ID');

  newIngredient = {
    name,
    description,
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0,
  };

  //tally up the macros for each of the component ingredients
  componentsForNewIngredient.rows.forEach(row => {
    const portionSize = components.find(el => el.ingredientId == row.id).portionSize;

    const recipe = {
      componentIngredientId: row.id,
      portionSize: portionSize,
    };

    //also build recipe associations to create new recipe
    recipeAssociations.push(recipe);

    newIngredient.calories += (row.calories * portionSize);
    newIngredient.protein += (row.protein * portionSize);
    newIngredient.carbohydrates += (row.carbohydrates * portionSize);
    newIngredient.fats += (row.fats * portionSize);
  });

  //before returning the ingredient, the new ingredient's recipe must be saved in the recipes table
  const finalNewIngredient = await createIngredientRaw(userId, newIngredient);

  recipeAssociations.forEach(ingredient => {
    ingredient.parentIngredientId = finalNewIngredient.id;
  });

  await insertRecipeComponents(recipeAssociations);

  return finalNewIngredient;
}

async function deleteIngredientById(userId, ingredientId) {
  let deleteIngredientQuery = {
    text: `DELETE FROM ingredients
                WHERE user_id = $1
                AND id = $2;`,
    params: [
      userId,
      ingredientId,
    ],
  };

  const result = await query(deleteIngredientQuery);

  return result.rowCount;
}

async function getIngredientsByUserId(userId) {
  let selectIngredientsQuery = {
    text: `SELECT *
            FROM ingredients
            WHERE user_id = $1;`,
    params: [
      userId,
    ],
  };

  return await query(selectIngredientsQuery);
}

async function insertRecipeComponents(recipeComponents) {
  let insertRecipeQuery = {
    text: `INSERT INTO recipes (parent_ingredient_id, component_ingredient_id, portion_size)
            VALUES ${recipeComponents.map((el, idx) => {
      const firstidx = (3 * idx) + 1;
      return `($${firstidx},$${firstidx + 1}, $${firstidx + 2})`;
    }).join(',')};`,

    params: recipeComponents.map(el => [el.parentIngredientId, el.componentIngredientId, el.portionSize]).flat()
  };

  return await query(insertRecipeQuery);
}

module.exports = {
  createIngredientRaw,
  createIngredientFromComponents,
  deleteIngredientById,
  getIngredientsByUserId,
};