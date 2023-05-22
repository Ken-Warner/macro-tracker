window.onload = (e) => {
  populateList();
};

const listContainer = document.querySelector('.list-container');
var listViewItems = [];

async function populateList() {
  
  while (listContainer.firstChild)
    listContainer.removeChild(listContainer.lastChild);

  let currentDate = (new Date()).toISOString().split('T')[0];
  
  try {
    const serverResponse = await fetch(`/meals/mealsForDate/${currentDate}`);
    const mealList = await serverResponse.json();
    listViewItems = mealList;

    mealList.forEach(element => {
      const mealCard = new ListMealCard(element);

      listContainer.appendChild(mealCard);
    });
    calculateMacros();
  } catch {
    //don't do anything
  }
}

function calculateMacros() {
  const macros = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  listViewItems.forEach((element) => {
    macros.calories += element.cal_per_serv;
    macros.protein += element.prot_per_serv;
    macros.carbs += element.carbs_per_serv;
    macros.fats += element.fats_per_serv;
  });

  updateMacroUI(macros);
}

function updateMacroUI(macros) {
  let totalCaloriesElement = document.getElementById('total-calories');
  let totalProteinElement = document.getElementById('total-protein');
  let totalCarbsElement = document.getElementById('total-carbs');
  let totalFatsElement = document.getElementById('total-fats');

  totalCaloriesElement.removeChild(totalCaloriesElement.firstChild);
  totalProteinElement.removeChild(totalProteinElement.firstChild);
  totalCarbsElement.removeChild(totalCarbsElement.firstChild);
  totalFatsElement.removeChild(totalFatsElement.firstChild);

  totalCaloriesElement.appendChild(document.createTextNode(macros.calories));
  totalProteinElement.appendChild(document.createTextNode(macros.protein));
  totalCarbsElement.appendChild(document.createTextNode(macros.carbs));
  totalFatsElement.appendChild(document.createTextNode(macros.fats));
}

function addMealToListContainer(newMeal) {
  listViewItems.push(newMeal);
  calculateMacros();
  listContainer.appendChild(new ListMealCard(newMeal));
}

function removeMealFromListContainer(userMealId) {
  [...listContainer.children].forEach((element) => {
    if (element.dataset.userMealId == userMealId)
      listContainer.removeChild(element);
  });

  listViewItems.filter((item, index, arr) => {
    //filter returns a collection of all the things that return true
    if (item.user_meal_id == userMealId) {
      //we can also mutate the array itself, which is what I'm doing
      //but I like this as an example of other use cases as well
      arr.splice(index, 1);
      return true;
    }
    return false;
  });

  calculateMacros();
}