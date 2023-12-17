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

module.exports = usersRouter;