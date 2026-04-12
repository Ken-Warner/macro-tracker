import { User } from "@macro-tracker/macro-tracker-shared";
import { query } from "./pool.js";

export async function getUser(
  username: string,
  password: string,
): Promise<User> {
  const getUserQuery = {
    text: `SELECT id, username FROM users
            WHERE username = $1
            AND password = crypt($2, password);`,
    params: [username, password],
  };

  const result = await query(getUserQuery);

  if (result.rowCount === 1) {
    const row = result.rows[0] as { id: number; username: string };
    return User.fromLoginRow(row);
  }
  throw new Error("Incorrect username or password");
}

export async function createUser(
  username: string,
  password: string,
  emailAddress: string,
): Promise<User> {
  const usernameCheck = {
    text: "SELECT COUNT( * ) FROM users WHERE username = $1;",
    params: [username],
  };

  const insertUserQuery = {
    text: `INSERT INTO users (username, password, email_address)
               VALUES ($1, crypt($2, gen_salt('bf')), $3)
               RETURNING id;`,
    params: [username, password, emailAddress],
  };

  const usernameCheckResult = await query(usernameCheck);
  const countRow = usernameCheckResult.rows[0] as { count: string };
  if (Number(countRow.count) > 0) {
    throw new Error("Username already exists");
  }

  const insertResult = await query(insertUserQuery);
  const idRow = insertResult.rows[0] as { id: number };
  return new User(idRow.id, username);
}
