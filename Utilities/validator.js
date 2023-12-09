const validator = () => {
  const usernames = /^[a-zA-Z0-9_]{4,20}$/;
  const passwords = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
  const dates = /^(20)\d{2}-(0[1-9]|1[1-2])-(0[1-9]|[1-2]\d|3[0-1])$/;
  
  isValidPassword = (password) => passwords.test(password);
  isValidUsername = (username) => usernames.test(username);
  // isValidDate = (date) => dates.test(date) && !isNaN(new Date(date));
  isValidDate = (date) => {
    let s = new Date(date);
    const dateParts = date.split('-');
    console.log(s);
    console.log(dateParts);
    const validation = !isNaN(new Date(dateParts[0], dateParts[1], dateParts[2]));
    console.log(validation);
    return validation;
  }

  return {
    isValidPassword,
    isValidUsername,
    isValidDate,
  }
}

module.exports = validator();