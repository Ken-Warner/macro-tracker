const express = require('express');

const { 
  createUser,
  logUserIn,
  logUserOut,
  httpNewUser,
} = require('./auth.controller');

const authRouter = express.Router();

authRouter.post('/new_user', createUser);
authRouter.get('/new_user', httpNewUser)
authRouter.post('/login', logUserIn);
authRouter.get('/logout', logUserOut);

authRouter.get('/*', (req, res) => {
  res.redirect('/');
});

module.exports = authRouter;