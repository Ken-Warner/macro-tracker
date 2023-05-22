const express = require('express');

const {
  getLandingPage,
} = require('./settings.controller');

const settingsRouter = new express.Router();

settingsRouter.get('/', getLandingPage)

settingsRouter.get('/*', (req, res) => {
  res.redirect('/');
});

module.exports = settingsRouter;