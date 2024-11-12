const submitButton = document.querySelector('input[type=submit]');
console.log(submitButton);

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();
  console.log('clicked');
});