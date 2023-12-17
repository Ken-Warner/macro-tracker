const {
  getUser,
  createUser,
} = require('../../models/users.model');

const validator = require('../../Utilities/validator');

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
    res.status(400).send(e.message);
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
    res.status(400).send(e.message);
  }
}

async function logUserOut(req, res) {
  req.session.destroy();
  res.status(200).send();
}

module.exports = {
  logUserIn,
  logUserOut,
  createNewUser,
}