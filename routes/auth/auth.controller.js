const path = require('path');
const { 
  createNewUser,
  getUser,
} = require('../../models/users.model');


async function createUser(req, res) {
  if (req.body.newpassword !== req.body.p_confirm) {
    res.render(path.join('auth', 'newUser'), { message: 'Passwords do not match!' });
  }

  const result = await createNewUser(req.body);

  if (!result.error) {
    req.session.userid = result.newUserId;
    req.session.username = req.body.newusername;
    res.render(path.join('subs', 'home'), {
      stylesheet: [ 'overview', 'toastMessage' ],
      javascript: [
        'addMealDropdown',
        'mealListView',
        path.join('components', 'addMealCard.component'),
        path.join('components', 'listMealCard.component'),
      ],
      layout: 'app',
    });
  } else {
    res.render(path.join('auth', 'newUser'), { message: result.error });
  }
}

async function logUserIn(req, res) {
  if (req.session.userid) {
    res.redirect('/');
  } else {
    // const user = await getUser(req.body.username, req.body.password);
    const user = await getUser('kencwarner', 'silver91');
    if (!user.error) {
      req.session.userid = user.id;
      req.session.username = user.username;
      res.status(200).render(path.join('subs', 'home'), {
        stylesheet: [ 'overview', 'toastMessage' ],
        javascript: [
          'addMealDropdown',
          'mealListView',
          path.join('components', 'addMealCard.component'),
          path.join('components', 'listMealCard.component'),
        ],
        layout: 'app' });
    } else {
      res.render(path.join('auth', 'login'), { message: user.error });
    }
  }
}

function logUserOut(req, res) {
  req.session.destroy();
  res.redirect('/');
}

function httpNewUser(req, res) {
  if (req.session.userid) {
    res.redirect('/');
  } else {
    res.status(200).render(path.join('auth', 'newUser'));
  }
}

module.exports = {
  createUser,
  logUserIn,
  logUserOut,
  httpNewUser,
};