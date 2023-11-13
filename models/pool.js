const { Pool } = require('pg');

const DEFAULT = Symbol('default');

const pool = new Pool({
  connectionString: process.env.DB_CONN_STRING || 'postgres://postgres:test1234@127.0.0.1:5432/postgres'
});

async function query({ text, params = [] }) {
  return new Promise((resolve, reject) => {
    if (!text) {
      reject({ message: "Invalid query" });
      return;
    }

    pool.query(text, params, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

//Builds a field and value list dynamically for a query respecting
//default vlaues in the value list
function buildInsert(fieldList, valueList) {
  if (fieldList.length !== valueList.length)
    throw new Error('Parameters and values must be of equal length');

  const queryFields = `(${fieldList.join(',')})`;

  let counter = 0;
  let queryParams = [];

  const queryValueList = valueList.map((element, index) => {
    if (element == DEFAULT) {
      return 'DEFAULT';
    } else {
      counter += 1;
      queryParams.push(element);
      return '$' + counter;
    }
  });

  const queryValues = `(${queryValueList.join(',')})`;
                  
  return [ queryFields, queryValues, queryParams ];
}

module.exports = {
  query,
  buildInsert,
  DEFAULT,
};