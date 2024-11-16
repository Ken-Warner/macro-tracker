const {
  getUser,
  createUser,
} = require('../../models/users.model');

const validator = require('../../Utilities/validator');

const {
  log,
  loggingLevels,
  formatResponse
} = require('../../Utilities/logger');

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
      res.status(400).send(JSON.stringify({ error: `Invalid username format.` }));
      return;
    }

    if (!validator.isValidPassword(req.body.password)) {
      res.status(400).send(JSON.stringify({ error: `Invalid password format.` }));
      return;
    }

    if (!validator.isValidEmail(req.body.emailAddress)) {
      res.status(400).send(JSON.stringify({ error: `Invalid Email Address.` }));
      return;
    }

    const result = await createUser(req.body.username,
                                    req.body.password,
                                    req.body.emailAddress);

    req.session.username = req.body.username;
    req.session.userId = result;

    res.status(201).send(JSON.stringify({ userId: result, username: req.body.username }));
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `createNewUser: ${e.message}`,
                            req.body);
    res.status(500).send(formatResponse(uuid));
  }
}

async function logUserIn(req, res) {
  if (req.session.userId && req.session.username) {
    res.status(200).send(
      JSON.stringify(
        {
          userId: req.session.userId,
          username: req.session.username,
        }));
    return;
  }

  try {
    const user = await getUser(req.body.username, req.body.password);

    req.session.userId = user.id;
    req.session.username = user.username;

    res.status(200).send(JSON.stringify(user));
  } catch (e) {
    const uuid = await log(loggingLevels.ERROR,
                            `logUserIn: ${e.message}`,
                            req.body);
    res.status(500).send(formatResponse(uuid));
  }
}

async function logUserOut(req, res) {
  req.session.destroy();
  res.redirect('/login');
}

module.exports = {
  logUserIn,
  logUserOut,
  createNewUser,
}