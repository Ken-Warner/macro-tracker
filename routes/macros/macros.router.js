const express = require('express');

const {
  getMacrosFromDateRange
} = require('./macros.controller');

const macrosRouter = express.Router();

macrosRouter.get('/', getMacrosFromDateRange);

module.exports = macrosRouter;