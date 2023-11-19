const express = require('express');

const {
  getWeighInData,
  postWeighInData,
} = require('./weighIn.controller');

const weighInRouter = express.Router();

weighInRouter.post('/', postWeighInData);
weighInRouter.get('/', getWeighInData);

weighInRouter.all('/*', (req, res, next) => {
  res.status(404).send();
  return;
});

module.exports = weighInRouter;