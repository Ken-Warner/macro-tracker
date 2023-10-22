const express = require('express');

const {
    createNewUser,
    logUserIn,
    logUserOut,
} = require('./users.controller');

const usersRouter = express.Router();

usersRouter.post('/create', createNewUser);
usersRouter.post('/login', logUserIn);
usersRouter.get('/logout', logUserOut);

usersRouter.get('/*', (req, res) => {
    res.status(404).send();
    return;
});

module.exports = usersRouter;