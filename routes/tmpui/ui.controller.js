const path = require('path');

function getLoginPage(req, res) {
  res.render(path.join(__dirname, '..', '..', 'views', 'login'), {
    stylesheet: [],
    javascript: [
      'login',
    ],
    layout: 'layout'
  });
}

function getUserHomePage(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).redirect('/login');
    return;
  }

  res.status(200).send(`Logged in as ${req.params.username}`);
}

module.exports = {
  getLoginPage,
  getUserHomePage,
};