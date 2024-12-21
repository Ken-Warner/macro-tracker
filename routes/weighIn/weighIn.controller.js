const {
  insertWeighInData,
  selectRecentWeighInData,
  selectWeighInDataForDateRange,
} = require("../../models/weighIn.model");

const validator = require("../../Utilities/validator");

const {
  loggingLevels,
  formatResponse,
  log,
} = require("../../Utilities/logger");

async function getWeighInData(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  if (!req.query.fromDate || !validator.isValidDate(req.query.fromDate)) {
    res.status(400).send(
      JSON.stringify({
        error: `fromDate must be supplied in the format YYYY-MM-DD`,
      })
    );
    return;
  }

  if (!req.query.toDate || !validator.isValidDate(req.query.toDate)) {
    res.status(400).send(
      JSON.stringify({
        error: `toDate must be supplied in the format YYYY-MM-DD`,
      })
    );
    return;
  }

  try {
    let weighInData = await selectWeighInDataForDateRange(
      req.session.userId,
      req.query.fromDate,
      req.query.toDate
    );
    weighInData = weighInData.map((el) => {
      return {
        date: el.date.toISOString().split("T")[0],
        weight: el.weight,
      };
    });

    res.status(200).send(JSON.stringify(weighInData));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `getWeighInData: ${e.message}`,
      req.query
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function getRecentWeighInData(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    const weighInData = await selectRecentWeighInData(req.session.userId);

    const apiResult = {
      date: weighInData.date.toISOString().split("T")[0],
      weight: weighInData.weight,
      targetCalories: weighInData.target_calories,
      targetProtein: weighInData.target_protein,
      targetCarbohydrates: weighInData.target_carbohydrates,
      targetFats: weighInData.target_fats,
    };

    res.status(200).send(JSON.stringify(apiResult));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `getRecentWeighInData: ${e.message}`,
      req.body
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function postWeighInData(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  let weighInData = {};

  if (!req.body.weight || !validator.isNumberGEZero(req.body.weight)) {
    res
      .status(400)
      .send(JSON.stringify({ error: `Please provide a valid weight.` }));
    return;
  }

  if (req.body.date && !validator.isValidDate(req.body.date)) {
    res.status(400).send(
      JSON.stringify({
        error: `Please provide a date in the format YYYY-MM-DD`,
      })
    );
    return;
  }

  weighInData = {
    weight: req.body.weight,
    date: req.body.date,
  };

  try {
    await insertWeighInData(req.session.userId, weighInData);

    res.status(200).send();
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `postWeighInData: ${e.message}`,
      req.body
    );
    res.status(500).send(formatResponse(uuid));
  }
}

module.exports = {
  getWeighInData,
  getRecentWeighInData,
  postWeighInData,
};
