const { query } = require('./pool');

async function getUser(username, password) { 
    let getUserQuery = {
        text: `SELECT id, username FROM users
            WHERE username = $1
            AND password = crypt($2, password);`,
        params: [
            username,
            password,
        ],
    };

    const result = await query(getUserQuery);

    if (result.rowCount == 1)
        return result.rows[0];
    else
        throw new Error('Incorrect username or password');
}

async function createUser(newUserData) {
    let usernameCheck = {
        text: 'SELECT COUNT( * ) FROM users WHERE username = $1;',
        params: [
            newUserData.username,
        ],
    };

    let insertUserQuery = {
        text: `INSERT INTO users (username, password, email_address)
               VALUES ($1, crypt($2, gen_salt('bf')), $3)
               RETURNING id;`,
        params: [
            newUserData.username,
            newUserData.password,
            newUserData.emailAddress,
        ],
    };

    const usernameCheckResult = await query(usernameCheck);

    if (usernameCheckResult.rows[0].count > 0) {
        throw new Error('Username already exists');
    } else {
        const insertResult = await query(insertUserQuery);

        return insertResult.rows[0].id;
    }
}

module.exports = {
    getUser,
    createUser,
}