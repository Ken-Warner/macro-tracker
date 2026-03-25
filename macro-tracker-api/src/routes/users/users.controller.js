import { getUser, createUser } from "../../models/users.model.js";
import validator from "../../Utilities/validator.js";
import { log, loggingLevels, formatResponse } from "../../Utilities/logger.js";

async function createNewUser(req, res) {
  if (req.session.userId && req.session.username) {
    res.status(400).send(JSON.stringify({ error: `User already logged in. ` }));
    return;
  }

  if (req.body.password !== req.body.passwordConfirm) {
    res.status(400);
    return;
  }

  try {
    if (!validator.isValidUsername(req.body.username)) {
      res
        .status(400)
        .send(JSON.stringify({ error: `Invalid username format.` }));
      return;
    }

    if (!validator.isValidPassword(req.body.password)) {
      res
        .status(400)
        .send(JSON.stringify({ error: `Invalid password format.` }));
      return;
    }

    if (!validator.isValidEmail(req.body.emailAddress)) {
      res.status(400).send(JSON.stringify({ error: `Invalid Email Address.` }));
      return;
    }

    const result = await createUser(
      req.body.username,
      req.body.password,
      req.body.emailAddress,
    );

    req.session.username = req.body.username;
    req.session.userId = result;

    res
      .status(201)
      .send(JSON.stringify({ userId: result, username: req.body.username }));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `createNewUser: ${e.message}`,
      req.body,
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function logUserIn(req, res) {
  if (req.session.userId && req.session.username) {
    res.status(200).send(
      JSON.stringify({
        userId: req.session.userId,
        username: req.session.username,
      }),
    );
    return;
  }

  if (req.body.username == "" || req.body.password == "") {
    //Request sent from a initial request to see if user is to be remembered, but didn't have a session cookie.
    res.status(500).send();
    return;
  }

  try {
    const user = await getUser(req.body.username, req.body.password);

    req.session.userId = user.id;
    req.session.username = user.username;

    if (req.body.rememberMe == true) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; //30 days
    } else {
      req.session.cookie.expires = false; //Terminate session when browser closed.
    }

    req.session.save();

    res
      .status(200)
      .send(JSON.stringify({ userId: user.id, username: user.username }));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `logUserIn: ${e.message}`,
      req.body,
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function logUserOut(req, res) {
  req.session.destroy((error) => {
    if (error) return res.status(500).send();
    res.clearCookie("connect.sid");
    res.status(200).send();
  });
}

export { logUserIn, logUserOut, createNewUser };
