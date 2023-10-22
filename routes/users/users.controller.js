const path = require('path');

const {
  getUser,
  createUser,
} = require('../../models/users.model');

async function createNewUser(req, res) {
  if (req.body.password !== req.body.passwordConfirm) {
    res.status(400);
    return;
  }

  try {
    const result = await createUser(req.body);

    req.session.username = req.body.username;
    req.session.userid = result;

    res.status(201).send(JSON.stringify({ userId: result, username: req.body.username }));
  } catch (e) {
    res.status(400).send(e.message);
  }
}

async function logUserIn(req, res) {
  if (req.session.userid && req.session.username) {
    res.status(200).send(
      JSON.stringify(
        {
          userId: req.session.userid,
          username: req.session.username,
        }));
    return;
  }

  try {
    const user = await getUser(req.body.username, req.body.password);

    req.session.userid = user.id;
    req.session.username = user.username;

    res.status(200).send(JSON.stringify(user));
  } catch (e) {
    res.status(400).send(e.message);
  }
}

async function logUserOut(req, res) {
  req.session.destroy();
  res.redirect('/');
}

module.exports = {
  logUserIn,
  logUserOut,
  createNewUser,
}