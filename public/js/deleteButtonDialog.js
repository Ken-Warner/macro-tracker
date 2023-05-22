const deleteMealButton = document.getElementById('deleteMealButton');

const deleleDialogConfirm = document.getElementById('deleteDialogConfirm');
const deleteDialog = document.getElementById('deleteMealDialog');

const cancelDeleteMealButton = document.getElementById('cancelDeleteMeal');
const confirmButton = document.getElementById('deleteMealConfirm');
const cancelConfirmButton = document.getElementById('cancelDeleteMealConfirm');

var mealToDeleteId = 0;

deleteMealButton.addEventListener('click', (e) => {
  deleteDialog.showModal();

  const items = deleteDialog.querySelectorAll('.delete-meal-dialog-item');

  items.forEach(e => e.addEventListener('click', deleteMealItemListener));
});

confirmButton.addEventListener('click', async (e) => {
  console.log('Confirmed with id', mealToDeleteId);

  const response = await fetch(`meals/deleteMeal/${mealToDeleteId}`, { method: 'DELETE' });
  
  if (response.status == 200) {
    const items = deleteDialog.querySelectorAll('.delete-meal-dialog-item');
    items.forEach((e) => {
      if (e.dataset.mealId == mealToDeleteId)
        deleteDialog.removeChild(e);
    });
    makeToast('Meal Deleted');
  } else {
    console.log('error');
    makeToast('Error occured while deleting.');
  }

  mealToDeleteId = 0;
  deleleDialogConfirm.close();
});

cancelConfirmButton.addEventListener('click', (e) => {
  mealToDeleteId = 0;
  deleteDialogConfirm.close();
});

cancelDeleteMealButton.addEventListener('click', (e) => {
  deleteDialog.close();
  mealToDeleteId = 0;
});

function deleteMealItemListener(e) {
  mealToDeleteId = e.target.dataset.mealId;
  deleteDialog.close();
  deleteDialogConfirm.showModal();
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