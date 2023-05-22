const { query } = require('./pool');

async function getUser(username, password) {
  let queryObject = {
    text: `SELECT * FROM users 
      WHERE username = $1 
      AND password = crypt($2, password);`,
    params: [
      username,
      password,
    ]
  };
  const res = await query(queryObject);

  if (res.rowCount == 1)
    return { id: res.rows[0].id, username: res.rows[0].username };
  else
    return { error: 'Incorrect username or password' };
}

async function createNewUser(newUserData) {
  let usernameCheck = {
    text: 'SELECT COUNT( * ) FROM users WHERE username = $1;',
    params: [
      newUserData.newusername,
    ],
  };

  let insertUserQuery = {
    text: `INSERT INTO users (username, password, email) VALUES 
      ($1, crypt($2, gen_salt('bf')), $3) RETURNING id;`,
    params: [
      newUserData.newusername,
      newUserData.newpassword,
      newUserData.email_address,
    ],
  };

  const usernameCheckResult = await query(usernameCheck);

  if (usernameCheckResult.rows[0].count > 0) {
    return { error: 'Username already taken.' };
  } else {
    const insertResult = await query(insertUserQuery);
    
    return { newUserId: insertResult.rows[0].id };
  }
}

module.exports = { 
  getUser,
  createNewUser,
};