import { User } from "@macro-tracker/macro-tracker-shared";
import { seedDefaultIngredients } from "./ingredients.model.js";
import { query, queryWithClient, withTransaction } from "./pool.js";

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
    return User.fromModel(result.rows[0].id, result.rows[0].username);
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
  if (usernameCheckResult.rows[0].count > 0) {
    throw new Error("Username already exists");
  }

  return withTransaction(async (client) => {
    const insertResult = await queryWithClient(client, insertUserQuery);
    const idRow = insertResult.rows[0] as { id: number };
    await seedDefaultIngredients(String(idRow.id), client);
    return new User(idRow.id, username);
  });
}

export async function upsertPasswordRecoveryToken(
  username: string,
  token: string,
  resetExpires: Date,
): Promise<string> {
  const existingPasswordRecoveryToken =
    await selectExistingPasswordRecoveryToken(username);

  if (existingPasswordRecoveryToken) {
    throw new Error("Password recovery token already exists.");
  }

  const emailAddress = await selectUserEmailAddress(username);

  const upsertPasswordRecoveryTokenQuery = {
    text: `INSERT INTO user_password_tokens (username, token, reset_expires)
      VALUES ($1, crypt($2, gen_salt('bf')), $3)
      ON CONFLICT (username) DO UPDATE SET token = crypt($2, gen_salt('bf')), reset_expires = $3;`,
    params: [username, token, resetExpires],
  };

  const result = await query(upsertPasswordRecoveryTokenQuery);

  if (result.rowCount !== 1) {
    throw new Error("Failed to set password recovery token.");
  }

  return emailAddress;
}

export async function selectPasswordRecoveryToken(
  username: string,
  token: string,
): Promise<boolean> {
  const now = new Date();
  const selectPasswordRecoveryTokenQuery = {
    text: `SELECT EXISTS (
    SELECT 1 FROM user_password_tokens WHERE username = $1
    AND token = crypt($2, token) 
    AND reset_expires > $3) AS valid;`,
    params: [username, token, now],
  };

  const result = await query(selectPasswordRecoveryTokenQuery);

  return result.rows[0].valid as boolean;
}

export async function updatePasswordRecoveryVerificationUuid(
  username: string,
  verificationUuid: string,
): Promise<void> {
  const updatePasswordRecoveryVerificationUuidQuery = {
    text: `UPDATE user_password_tokens SET verification_uuid = $1 WHERE username = $2;`,
    params: [verificationUuid, username],
  };

  const result = await query(updatePasswordRecoveryVerificationUuidQuery);

  if (result.rowCount !== 1) {
    throw new Error("Failed to update password recovery verification UUID.");
  }
}

async function selectUserEmailAddress(username: string): Promise<string> {
  const selectUserEmailAddressQuery = {
    text: "SELECT email_address FROM users WHERE username = $1;",
    params: [username],
  };

  const result = await query(selectUserEmailAddressQuery);

  if (result.rowCount !== 1) {
    throw new Error("Failed to select user email address.");
  }
  return result.rows[0].email_address as string;
}

async function selectExistingPasswordRecoveryToken(
  username: string,
): Promise<boolean> {
  const now = new Date();

  const selectExistingPasswordRecoveryTokenQuery = {
    text: "SELECT COUNT(*) FROM user_password_tokens WHERE username = $1 AND reset_expires > $2;",
    params: [username, now],
  };

  const result = await query(selectExistingPasswordRecoveryTokenQuery);

  if (Number(result.rows[0].count) > 0) {
    return true;
  }
  return false;
}
