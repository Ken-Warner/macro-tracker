const express = require('express');

const {
  getMacrosFromDateRange
} = require('./macros.controller');

const macrosRouter = express.Router();

macrosRouter.get('/', getMacrosFromDateRange);

macrosRouter.all('/*', (req, res, next) => {
  res.status(404).send();
  return;
});

module.exports = macrosRouter;