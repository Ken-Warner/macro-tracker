const express = require('express');

const {
  getWeighInData,
  postWeighInData,
} = require('./weighIn.controller');

const weighInRouter = express.Router();

weighInRouter.post('/', postWeighInData);
weighInRouter.get('/', getWeighInData);

module.exports = weighInRouter;