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

  let weighInData = {};

  if (!req.body.weight || req.body.weight <= 0) {
    res.status(400).send(JSON.stringify({ error: `Please provide a valid weight.` }));
    return;
  }

  if (req.body.date) {
    const dateRegex = /\d{4}-\d{2}-\d{2}/;

    if (!dateRegex.test(req.body.date)) {
      res.status(400).send(JSON.stringify({ error: `Please provide a date in the format YYYY-MM-DD` }));
      return;
    }
  }

  weighInData = {
    weight: req.body.weight,
    date: req.body.date,
  };

  try {
    await insertWeighInData(req.session.userid, weighInData);

    res.status(200).send();
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `An unexpected error occurred: ${e.message}` }));
  }
}

module.exports = {
  getWeighInData,
  postWeighInData,
};