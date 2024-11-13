const express = require('express');

const {
  getLoginPage,
  getUserHomePage,
} = require('./ui.controller');

const uiRouter = express.Router();

uiRouter.get('/login', getLoginPage);
uiRouter.get('/:username/home', getUserHomePage);

module.exports = uiRouter;