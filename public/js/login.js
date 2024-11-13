const submitButton = document.querySelector('input[type=submit]');

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const inputUsername = document.querySelector('input[name=username]');
  const inputPassword = document.querySelector('input[name=password]');

  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: inputUsername.value,
        password: inputPassword.value,
      })
    });

    const result = await response.json();

    if (response.status == 200) {
      window.location.replace(`/${result.username}/home`);
    } else {
      console.log('log in failed');
    }
  } catch (error) {
    console.log(error);
  }
});