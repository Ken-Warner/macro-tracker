const express = require('express');

const usersRouter = require('./users/users.router');

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);

usersRouter.get('/*', (req, res) => {
    res.status(404).send();
    return;
});

module.exports = apiRouter;