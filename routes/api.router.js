const express = require('express');

const usersRouter = require('./users/users.router');
const ingredientsRouter = require('./ingredients/ingredients.router');

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/ingredients', ingredientsRouter);

usersRouter.get('/*', (req, res) => {
    res.status(404).send();
    return;
});

module.exports = apiRouter;