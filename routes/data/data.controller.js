const path = require('path');

const {
  getDataForDateRange,
} = require('./../../models/data.model');


function httpGetLandingPage(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }

  res.status(200).render(path.join('subs', 'data', 'landing'), {
    stylesheet: [],
    javascript: [],
    layout: 'app',
  });
}

async function apiGetDataForDateRange(req, res) {
  if (!req.session.userid) {
    res.status(503).send();
    return;
  }

  const mealData = await getDataForDateRange( req.session.userid, req.body.fromDate, req.body.toDate);

  //still need validation
  console.log(mealData);

  if (mealData.rowCount > 0) {
    res.status(200).send(mealData.rows);
    //tabulate the data
    const chartData = {
      
    };
  } else {
    res.status(204).send();
  }
}

module.exports = {
  httpGetLandingPage,
  apiGetDataForDateRange,
};