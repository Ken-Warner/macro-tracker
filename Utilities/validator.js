const validator = () => {
  const usernames = /^[a-zA-Z0-9_]{4,20}$/;
  const passwords = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
  const dates = /^(20)\d{2}-(0[1-9]|1[1-2])-(0[1-9]|[1-2]\d|3[0-1])$/;
  const numbers = /^\d+$/;
  //This could probably be more robust
  const emailAddresses = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  
  isValidPassword = (password) => passwords.test(password);
  isValidUsername = (username) => usernames.test(username);
  isNumberGEZero = (number) => numbers.test(number) && number >= 0;
  isValidEmail = (email) => emailAddresses.test(email);
  isValidDate = (date) => {
    if (!dates.test(date))
      return false;
    
    //Dates are a little weird. The regex isn't enough on it's own.
    //Invalid dates like 2023-11-31 are valid to the regex and when are
    //created as a new Date() return 2023-12-01 because it rolls over
    //the extra day. So something like !isNaN(date) doesn't work.
    //Create a date from it and check if it is still the same as the date
    //passed in to make sure it is valid.
    let convertedDate = new Date(date).toISOString().split('T')[0];
    
    if (convertedDate !== date)
      return false;
    
    return true;
  }

  return {
    isValidPassword,
    isValidUsername,
    isNumberGEZero,
    isValidEmail,
    isValidDate,
  }
}

module.exports = validator();