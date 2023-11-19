const express = require('express');

const usersRouter = require('./users/users.router');
const ingredientsRouter = require('./ingredients/ingredients.router');
const mealsRouter = require('./meals/meals.router');
const weighInRouter = require('./weighIn/weighIn.router');

const apiRouter = express.Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/ingredients', ingredientsRouter);
apiRouter.use('/meals', mealsRouter);
apiRouter.use('/weighIn', weighInRouter);

usersRouter.all('/*', (req, res, next) => {
    res.status(404).send();
    return;
});

module.exports = apiRouter;