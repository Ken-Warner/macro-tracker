const express = require("express");

const {
  getWeighInData,
  getRecentWeighInData,
  postWeighInData,
} = require("./weighIn.controller");

const weighInRouter = express.Router();

weighInRouter.post("/", postWeighInData);
weighInRouter.get("/recent", getRecentWeighInData);
weighInRouter.get("/", getWeighInData);

module.exports = weighInRouter;
