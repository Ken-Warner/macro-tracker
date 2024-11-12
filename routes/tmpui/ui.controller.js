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

module.exports = {
  getLoginPage
};