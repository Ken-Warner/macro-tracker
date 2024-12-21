const express = require("express");

const {
  getMacrosFromDateRange,
  getTodaysMacros,
} = require("./macros.controller");

const macrosRouter = express.Router();

macrosRouter.get("/today", getTodaysMacros);
macrosRouter.get("/", getMacrosFromDateRange);

module.exports = macrosRouter;
