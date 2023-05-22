const addMealDropdown = document.getElementById('addMealDropdown');
const mealContainer = document.getElementById('mealContainer');

const addMealButton = document.getElementById('addMealButton');
const addSingleMealButton = document.getElementById('addSingleMealButton');

const modalCancelButton = document.getElementById('modalCancelButton');
const modalOkButton = document.getElementById('modalOkButton');
const modalMealName = document.querySelector('.modal-meal-name');
const modalMealDescription = document.querySelector('.modal-meal-desc');

const mealSearchBox = document.getElementById('mealSearchBox');

var mealCards = [];

var isDropdownLoaded = false;
var selectedAddMealCard = 0;

addMealButton.addEventListener('click', async (e) => {
  if (addMealDropdown.clientHeight) {
    addMealDropdown.style.height = 0;
    setTimeout(() => {
      addMealDropdown.style.paddingTop = 0;
      mealSearchBox.value = "";
      repopulateMealContainerDropdown();
    }, 500);

  } else {

    if (!isDropdownLoaded) {
      try {
        const apiResponse = await fetch('/meals/meals');
        const responseJson = await apiResponse.json();
        addMealsToDropdown(responseJson);
      } catch (error) {
        //do nothing
      }
    }
    
    addMealDropdown.style.paddingTop = '20px';
    addMealDropdown.style.height = addMealDropdown.scrollHeight + 30 + 'px';
  }
});

function addMealsToDropdown(data) {
  clearMealContainerDropdown();
  mealCards = [];

  [...data].forEach((element) => {
    const newMealCard = new AddMealCard(element);

    mealCards.push(newMealCard);

    mealContainer.appendChild(newMealCard);
  });

  isDropdownLoaded = true;
}

modalCancelButton.addEventListener('click', (e) => {
  hideModalWindow();
});

modalOkButton.addEventListener('click', async (e) => {
  const servingSize = document.getElementById('mealServingSize').value;
  if (servingSize == '' || servingSize == 0) {
    makeToast('Invalid Serving Size');
    return;
  }

  //Dates are hard
  let curDate = new Date();
  curDate -= (curDate.getTimezoneOffset() * 60 * 1000); //convert minutes to milliseconds
  curDate = new Date(curDate);

  const response = await fetch('/meals/mealForDate', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mealid: selectedAddMealCard.id,
      servingSize: servingSize,
      mealTime: curDate.toISOString(),
    }),
  });

  if (response.status == 201) {
    const responseBody = await response.json();
    const newUserMeal = {
      user_meal_id: responseBody.id,
      meal_id: selectedAddMealCard.id,
      name: selectedAddMealCard.name,
      cal_per_serv: selectedAddMealCard.cal_per_serv,
      prot_per_serv: selectedAddMealCard.prot_per_serv,
      carbs_per_serv: selectedAddMealCard.carbs_per_serv,
      fats_per_serv: selectedAddMealCard.fats_per_serv,
      meal_time: curDate.toISOString(),
      serving_size: servingSize,
    }

    addMealToListContainer(newUserMeal);
  }

  hideModalWindow();
  makeToast('Meal Added');
});

function hideModalWindow() {
  selectedAddMealCard = 0;

  while (modalMealName.firstChild)
    modalMealName.removeChild(modalMealName.lastChild);
  while(modalMealDescription.firstChild)
    modalMealDescription.removeChild(modalMealDescription.lastChild);

  document.getElementById('mealServingSize').value = '';
  document.querySelector('.add-meal-modal').style.display = 'none';
}

function showModalWindow(mealCard) {
  selectedAddMealCard = mealCard;

  modalMealName.appendChild(document.createTextNode(mealCard.name));
  modalMealDescription.appendChild(document.createTextNode(mealCard.description));

  document.querySelector('.add-meal-modal').style.display = 'grid';
}

function makeToast(toastText) {
  let toast = document.querySelector('.toast-message');

  if (!toast) {
    toast = document.createElement('div');
    document.querySelector('main').appendChild(toast);
    toast.classList.add('toast-message');
  } else {
    while (toast.firstChild)
      toast.removeChild(toast.lastChild);
  }

  toast.appendChild(document.createTextNode(toastText));

  toast.classList.remove("toast-message");
  void toast.offsetWidth;
  toast.classList.add("toast-message");
}

mealSearchBox.addEventListener('input', (e) => {
  if (!isDropdownLoaded)
    return;

  clearMealContainerDropdown();

  mealCards.forEach((card) => {
    if (card.mealCardData.name.toUpperCase().includes(mealSearchBox.value.toUpperCase()))
      mealContainer.appendChild(card);
  });
});

function clearMealContainerDropdown() {
  while (mealContainer.firstChild)
    mealContainer.removeChild(mealContainer.lastChild);
}

function repopulateMealContainerDropdown() {

  clearMealContainerDropdown();

  mealCards.forEach((card) => {
    mealContainer.appendChild(card);
  });
}

