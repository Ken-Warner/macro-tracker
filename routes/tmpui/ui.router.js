const express = require('express');

const {
  getLoginPage,
} = require('./ui.controller');

const uiRouter = express.Router();

uiRouter.get('/login', getLoginPage);

module.exports = uiRouter;