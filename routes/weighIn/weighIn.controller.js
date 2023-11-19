const {
  insertWeighInData,
  selectWeighInDataForDateRange,
} = require('../../models/weighIn.model');

async function getWeighInData(req, res) {
  if(!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  //validate dates from query string

  //call model to get data

  res.status(200).send();
  return;
}

async function postWeighInData(req, res) {
  if(!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  //validate weight data
  //validate optional input date

  //call model to post new data

  res.status(200).send();
  return;
}

module.exports = {
  getWeighInData,
  postWeighInData,
};