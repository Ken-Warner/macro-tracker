const { Pool } = require('pg');

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

module.exports = { query };