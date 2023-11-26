const {
  insertWeighInData,
  selectWeighInDataForDateRange,
} = require('../../models/weighIn.model');

async function getWeighInData(req, res) {
  if(!req.session.userid || !req.session.username) {
    res.status(401).send();
    return;
  }

  const dateRegex = /\d{4}-\d{2}-\d{2}/;

  if (!req.query.fromDate || !dateRegex.test(req.query.fromDate)) {
    res.status(400).send(JSON.stringify({ error: `fromDate must be supplied in the format YYYY-MM-DD` }));
    return;
  }

  if (!req.query.toDate || !dateRegex.test(req.query.toDate)) {
    res.status(400).send(JSON.stringify({ error: `toDate must be supplied in the format YYYY-MM-DD` }));
    return;
  }

  try {
    let weighInData = await selectWeighInDataForDateRange(req.session.userid, req.query.fromDate, req.query.toDate);
    weighInData = weighInData.map(el => {
        return { date: el.date.toISOString().split('T')[0],
                 weight: el.weight }
    });

    res.status(200).send(JSON.stringify(weighInData));
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `An unexpected error occurred: ${e.message}` }));
  }
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