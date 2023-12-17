const {
  selectMacrosFromDateRange,
} = require('../../models/macros.model');

const validator = require('../../Utilities/validator');

async function getMacrosFromDateRange(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).send();
    return;
  }

  if (!req.query.fromDate || !validator.isValidDate(req.query.fromDate)) {
    res.status(400).send(JSON.stringify({ error:`You must provide a fromDate in the format YYYY-MM-DD` }));
    return;
  }

  if (!req.query.toDate || !validator.isValidDate(req.query.toDate)) {
    res.status(400).send(JSON.stringify({ error:`You must provide a toDate in the format YYYY-MM-DD` }));
    return;
  }

  try {
    let macroData = await selectMacrosFromDateRange(req.session.userid,
                                                    req.query.fromDate,
                                                    req.query.toDate);

    macroData = macroData.map(el => {
      return {
        date: el.date.toISOString().split('T')[0],
        calories: el.calories,
        protein: el.protein,
        carbohydrates: el.carbohydrates,
        fats: el.fats
      };
    });
    
    res.status(200).send(JSON.stringify(macroData));
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: `Unable to get data: ${e.message}` }));
  }
}

module.exports = {
  getMacrosFromDateRange
};