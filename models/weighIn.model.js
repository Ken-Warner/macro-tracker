const {
  query,
  DEFAULT,
  buildInsert,
 } = require('./pool');

async function insertWeighInData(userId, weighInData) {

  const fields = [
    'user_id',
    'weight',
    'date'
  ];

  const values = [ 
    userId,
    weighInData.weight,
    weighInData.date || DEFAULT
  ];

  [
    queryFields,
    queryValues,
    queryParams
  ] = buildInsert(fields, values);

  let insertWeighInDataQuery = {
    text: `INSERT INTO user_weights ${queryFields}
            VALUES ${queryValues}
            RETURNING *;`,
    params: queryParams,
  };

  const result = await query(insertWeighInDataQuery);

  if (result.rowCount != 1)
    throw new Error('Unable to insert new weight');
}

async function selectWeighInDataForDateRange(userId, fromDate, toDate) {
  let weighInDataQuery = {
    text: `SELECT date, weight
            FROM user_weights
            WHERE user_id = $1
              AND date >= $2
              AND date <= $3;`,
    params: [
      userId,
      fromDate,
      toDate
    ]
  };

  const result = await query(weighInDataQuery);

  return result.rows;
}

module.exports = {
  insertWeighInData,
  selectWeighInDataForDateRange,
};