const path = require('path');

function getLoginPage(req, res) {
  res.render(path.join(__dirname, '..', '..', 'views', 'login'), {
    javascript: [
      'login',
      'toast',
    ],
    stylesheet: [
      'login',
      'toastMessage',
    ],
    layout: 'layout'
  });
}

function getUserHomePage(req, res) {
  if (!req.session.userId || !req.session.username) {
    res.status(401).redirect('/login');
    return;
  }

  res.status(200).render(path.join(__dirname, '..', '..', 'views', 'userHome'), {
    javascript: [

    ],
    stylesheet: [
      'home'
    ],
    layout: 'layout',
    user: {
      userId: req.session.userId,
      username: req.session.username,
    }
  });
}

module.exports = {
  getLoginPage,
  getUserHomePage,
};