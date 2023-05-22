
const path = require('path');

const {
  getMeals,
  getUserMeals,
  addMeal,
  deleteMeal,
  createMeal,
  deleteUserMeal,
} = require('../../models/meals.model');

async function getMealsForDate(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }

  const dbResponse = await getMeals(req.session.userid, req.params.date);

  res.status(200).json(dbResponse);
}

async function addNewMealForDate(req, res) {
  if (!req.session.userid) {
    res.status(401).send(); //HTTP-unauthorized
    return;
  }

  let newUserMeal = {
    userid: req.session.userid,
    mealid: req.body.mealid,
    mealTime: req.body.mealTime,
    servingSize: req.body.servingSize,
  }

  const result = await addMeal(newUserMeal);

  if (!result.error) {
    newUserMeal.id = result.rows[0].id;
    res.status(201).json(newUserMeal); //HTTP-created
  } else {
    res.status(500).send(); //HTTP-Internal Server Error
  }
  return;
}

async function removeMealFromDailyMealList(req, res) {
  if (!req.session.userid) {
    res.status(401).send();
    return;
  }

  const dbResult = await deleteUserMeal(req.params.id, req.session.userid);

  if (dbResult == 1) {
    res.status(200).send();
  } else {
    res.status(404).send();
  }

  return;
}

async function getMealsForUser(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }

  const result = await getUserMeals(req.session.userid);

  if (!result.error) {
    res.status(200).json(result);
  } else {
    //500
  }
}

async function createNewMealForUser(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }
  const newMealObject = req.body;
  newMealObject.userid = req.session.userid;

  responseObject = {
    layout: 'app',
    stylesheet: ['generalForms'],
    mealName: req.body.name,
    mealDescription: req.body.description,
    mealCalories: req.body.calPerServ,
    mealProtein: req.body.protPerServ,
    mealCarbs: req.body.carbsPerServ,
    mealFats: req.body.fatsPerServ,
  };

  if (newMealObject.name == "" || !/^[a-zA-z\d\s]{1,20}$/.test(newMealObject.name)) {
    responseObject.mealName = "";
    responseObject.message = "Invalid meal name.";
    res.status(500).render(path.join('subs', 'createNewMeal'), responseObject);
    return;
  }
  if (newMealObject.calPerServ == "" || !/^[0-9]{1,4}$/.test(newMealObject.calPerServ)) {
    responseObject.mealCalories = "";
    responseObject.message = "Invalid number of calories.";
    res.status(500).render(path.join('subs', 'createNewMeal'), responseObject);
    return;
  }

  //database doesn't accept empty strings for smallint, it doesn't use the DEFAULT
  if (newMealObject.protPerServ == "")
    newMealObject.protPerServ = 0;
  if (newMealObject.carbsPerServ == "")
    newMealObject.carbsPerServ = 0;
  if (newMealObject.fatsPerServ == "")
    newMealObject.fatsPerServ = 0;
  newMealObject.active = true;

  const result = await createMeal(newMealObject);

  if (!result.error) {
    res.status(200).render(path.join('subs', 'home'), {
      layout: 'app',
      stylesheet: ['overview', 'toastMessage'],
      javascript: [
        'addMealDropdown',
        'mealListView',
        path.join('components', 'addMealCard.component'),
        path.join('components', 'listMealCard.component'),
      ],
      message: 'meal created',
    });
  } else {
    responseObject.message = result.error;
    res.status(500).render(path.join('subs', 'createNewMeal'), responseObject);
  }
}

async function createNewSingleMeal(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }
  const newMealObject = req.body;
  newMealObject.userid = req.session.userid;

  responseObject = {
    layout: 'app',
    stylesheet: ['generalForms'],
    singularMeal: true,
    mealName: req.body.name,
    mealDescription: req.body.description,
    mealCalories: req.body.calPerServ,
    mealProtein: req.body.protPerServ,
    mealCarbs: req.body.carbsPerServ,
    mealFats: req.body.fatsPerServ,
  };

  if (newMealObject.name == "" || !/^[a-zA-z\d\s]{1,20}$/.test(newMealObject.name)) {
    responseObject.mealName = "";
    responseObject.message = "Invalid meal name.";
    res.status(500).render(path.join('subs', 'createNewMeal'), responseObject);
    return;
  }
  if (newMealObject.calPerServ == "" || !/^[0-9]{1,4}$/.test(newMealObject.calPerServ)) {
    responseObject.mealCalories = "";
    responseObject.message = "Invalid number of calories.";
    res.status(500).render(path.join('subs', 'createNewMeal'), responseObject);
    return;
  }

  //database doesn't accept empty strings for smallint, it doesn't use the DEFAULT
  if (newMealObject.protPerServ == "")
    newMealObject.protPerServ = 0;
  if (newMealObject.carbsPerServ == "")
    newMealObject.carbsPerServ = 0;
  if (newMealObject.fatsPerServ == "")
    newMealObject.fatsPerServ = 0;
  newMealObject.active = false;

  let noError = true;

  const mealCreateResponse = await createMeal(newMealObject);
  if (!mealCreateResponse.error) {

    //Dates are hard
    let curDate = new Date();
    curDate -= (curDate.getTimezoneOffset() * 60 * 1000); //convert minutes to milliseconds
    curDate = new Date(curDate);

    const addMealResponse = await addMeal({
      userid: req.session.userid,
      mealid: mealCreateResponse.id,
      servingSize: 1,
      mealTime: curDate.toISOString(),
    });

    if (addMealResponse.error)
      noError = false;
  } else {
    noError = false;
  }

  if (noError) {
    res.status(200).render(path.join('subs', 'home'), {
      layout: 'app',
      stylesheet: ['overview', 'toastMessage'],
      javascript: [
        'addMealDropdown',
        'mealListView',
        path.join('components', 'addMealCard.component'),
        path.join('components', 'listMealCard.component'),
      ],
      message: 'meal created',
    });
  } else {
    responseObject.message = result.error;
    res.status(500).render(path.join('subs', 'createNewMeal'), responseObject);
  }
}

async function softDeleteMeal(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }

  const dbResponse = await deleteMeal(req.params.id);

  if (!dbResponse.error) {
    res.status(200).send();
  } else {
    res.status(500).send();
  }
}

function httpCreateNewSingleMeal(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }

  res.status(200).render(path.join('subs', 'createNewMeal'), {
    stylesheet: ['generalForms'],
    singularMeal: true,
    layout: 'app',
  })
}

function httpCreateNewMeal(req, res) {
  if (!req.session.userid) {
    res.redirect('/');
    return;
  }
  res.status(200).render(path.join('subs', 'createNewMeal'), {
    stylesheet: ['generalForms'],
    layout: 'app'
  });
}

module.exports = {
  getMealsForDate,
  getMealsForUser,
  createNewMealForUser,
  addNewMealForDate,
  createNewSingleMeal,
  softDeleteMeal,
  httpCreateNewMeal,
  httpCreateNewSingleMeal,
  removeMealFromDailyMealList,
};