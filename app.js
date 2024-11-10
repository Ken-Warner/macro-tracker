const path = require('path');

const express = require('express');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');

const apiRouter = require('./routes/api.router');

require('dotenv').config();

const app = express();

//set up handlebars
app.set('view engine', 'hbs');
app.emit('views', path.join(__dirname, 'views'));

//expect json
app.use(express.json());

//setup static domains to provide JS and CSS for views
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

//setup session variables
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

app.use('/api', apiRouter);
// Frontend server routes

app.all('/*', (req, res) => {
    res.status(404).send(JSON.stringify({ error: `The resource you were looking for could not be found.` }));
});

module.exports = app;