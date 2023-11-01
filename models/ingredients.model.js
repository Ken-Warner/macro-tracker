const { query } = require('./pool');

async function createIngredient() {

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
  createIngredient,
  deleteIngredientById,
  getIngredientsByUserId,
};