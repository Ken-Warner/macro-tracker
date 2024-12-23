const {
  selectMacrosFromDateRange,
  selectTodaysMacros,
} = require("../../models/macros.model");

const validator = require("../../Utilities/validator");
const {
  log,
  loggingLevels,
  formatResponse,
} = require("../../Utilities/logger");

async function getMacrosFromDateRange(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  if (!req.query.fromDate || !validator.isValidDate(req.query.fromDate)) {
    res.status(400).send(
      JSON.stringify({
        error: `You must provide a fromDate in the format YYYY-MM-DD`,
      })
    );
    return;
  }

  if (!req.query.toDate || !validator.isValidDate(req.query.toDate)) {
    res.status(400).send(
      JSON.stringify({
        error: `You must provide a toDate in the format YYYY-MM-DD`,
      })
    );
    return;
  }

  try {
    let macroData = await selectMacrosFromDateRange(
      req.session.userId,
      req.query.fromDate,
      req.query.toDate
    );

    macroData = macroData.map((el) => {
      return {
        date: el.date.toISOString().split("T")[0],
        calories: el.calories,
        protein: el.protein,
        carbohydrates: el.carbohydrates,
        fats: el.fats,
      };
    });

    res.status(200).send(JSON.stringify(macroData));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `getMacrosFromDateRange: ${e.message}`,
      req.query
    );
    res.status(500).send(formatResponse(uuid));
  }
}

async function getTodaysMacros(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  try {
    const queryResult = await selectTodaysMacros(
      req.session.userId,
      req.query.today
    );

    const apiResult = {
      date: req.query.today,
      calories: queryResult.calories || 0,
      protein: queryResult.protein || 0,
      carbohydrates: queryResult.carbohydrates || 0,
      fats: queryResult.fats || 0,
    };

    res.status(200).send(JSON.stringify(apiResult));
  } catch (e) {
    const uuid = await log(
      loggingLevels.ERROR,
      `getTodaysMacros: ${e.message}`,
      req.query
    );
    res.status(500).send(formatResponse(uuid));
  }
}

module.exports = {
  getMacrosFromDateRange,
  getTodaysMacros,
};
