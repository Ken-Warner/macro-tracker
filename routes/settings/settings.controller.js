const path = require('path');

const {
  getUserMeals,
} = require('./../../models/meals.model');

async function getLandingPage(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }

  const meals = await getUserMeals(req.session.userid);

  res.status(200).render(
    path.join('subs', 'settings', 'landing'),
    {
      stylesheet: ['settings', 'toastMessage'],
      javascript: ['deleteButtonDialog'],
      meals: meals,
      layout: 'app'
    }
  );
}

module.exports = {
  getLandingPage,
};