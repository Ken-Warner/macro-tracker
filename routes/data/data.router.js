const express = require('express');

const {
  httpGetLandingPage,
  apiGetDataForDateRange
} = require('./data.controller');

const dataRouter = new express.Router();

//pages
dataRouter.get('/', httpGetLandingPage);

//api
dataRouter.post('/getMealDataForDateRange', apiGetDataForDateRange);


dataRouter.get('/*', (req, res) => {
  res.redirect('/');
});

module.exports = dataRouter;