const path = require('path');

const express = require('express');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth/auth.router');
const mealsRouter = require('./routes/meals/meals.router');
const settingsRouter = require('./routes/settings/settings.router');
const dataRouter = require('./routes/data/data.router');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use(express.urlencoded({ extended: true }));
app.use(sessions({
  secret: process.env.SESSION_SECRET || 'somethingsecret',
  saveUninitialized: true,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000 //1 day
  },
  resave: false,
}));
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/meals', mealsRouter);
app.use('/settings', settingsRouter);
app.use('/data', dataRouter);

app.get('/*', (req, res) => {
  const session = req.session;

  if (session.userid) {
    res.render(path.join('subs', 'home'), {
      stylesheet: [ 
        'overview',
        'toastMessage'
      ],
      javascript: [
        'addMealDropdown',
        'mealListView',
        path.join('components', 'addMealCard.component'),
        path.join('components', 'listMealCard.component'),
      ],
      layout: 'app',
    });
  } else {
    res.render(path.join('auth', 'login'));
  }
});

module.exports = app;