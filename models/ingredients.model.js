const { query } = require('./pool');

async function createIngredientRaw(userid, ingredient) {
  //For batch input
  // let createIngredientQuery = {
  //   text: `INSERT INTO ingredients
  //             (user_id, name, description, calories, protein, carbohydrates, fats)
  //             VALUES ${ingredients.map(ingredient => {
  //     return `($1,'${ingredient.name}','${ingredient.description || ''}',${ingredient.calories || 0},${ingredient.protein || 0},${ingredient.carbohydrates || 0},${ingredient.fats || 0})`;
  //   }).join(',')}
  //             RETURNING *;`,
  //   params: [
  //     userid
  //   ],
  // };
  let createIngredientQuery = {
    text: `INSERT INTO ingredients
            (user_id, name, description, calories, protein, carbohydrates, fats)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;`,
    params: [
      userid,
      ingredient.name,
      ingredient.description || '',
      ingredient.calories || 0,
      ingredient.protein || 0,
      ingredient.carbohydrates || 0,
      ingredient.fats || 0,
    ],
  };

  try {
    const result = await query(createIngredientQuery);

    if (result.rowCount == 1)
      return result.rows[0];
  } catch (e) {
    throw new Error('Could not create new ingredient:' + e.message);
  }
}

async function createIngredientFromComponents(userid, components) {
  //select all components with the provided ids
  let getComponentsQuery = {
    text: `SELECT id, calories, protein, carbohydrates, fats
            FROM ingredients
            WHERE id = ANY($1::int[])
            AND user_id = $2;`,
    params: [
      components.map(component => component.id),
      userid,
    ],
  };

  const componentsForNewIngredient = await query(getComponentsQuery);
  console.log(componentsForNewIngredient);
  //using the portion size, tally up all the macros into a new ingredient
  //use create ingredient raw to create the new ingredient??
    //else just do a new query
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

  if (result.rowCount == 1)
    return;
  else
    throw new Error('No Ingredient Found with that ID');
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

  const result = await query(selectIngredientsQuery);

  if (result.rowCount > 0)
    return result;
  else
    throw new Error('No Ingredients found');
}

module.exports = {
  createIngredientRaw,
  createIngredientFromComponents,
  deleteIngredientById,
  getIngredientsByUserId,
};