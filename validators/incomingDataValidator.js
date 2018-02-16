const html_new_line = '<br />';

// funkcja sparwdzająca czy string jest adresem email
function validateGivenEmail(emailToValidate){
	// \S+ - conajmniej jeden znak nie będący znakiem odstępu (white space)
	// posługując się znakami / / tworzony jest obiekt wyrażenia regularnego	
	// mój prosty regex :) - bo nie rozumiem tego powyżej ( nie przetestowałem :( )
	var REGEX_EMAIL = /\S+@\S+\.\S+/;
	return REGEX_EMAIL.test(emailToValidate);
}

function sufficientPasword(password){
  if( password.search(/[A-Z]/) < 0 ){
    return false;
  } else if ( password.search(/[0-9]/) < 0 ) {
    return false;
  } else if ( password.length < 4 ){
    return false;
  } else if( password.replace(/\s/g,'').length !== password.length ){
    return false;
  }
  return true;
}

function addPasswordRequirementsMessages(password, errorMessageAdderFunction) {
  console.log(password.search(/[A-Z]/));
  if( password.search(/[A-Z]/) < 0 ){
    errorMessageAdderFunction("Hasło musi składać się przynajmniej z jednej dużej litery!");
  }
  
  if ( password.search(/[0-9]/) < 0 ) {
    errorMessageAdderFunction("Hasło musi składać się przynajmniej z jednej cyfry!");
  }

  if ( password.length < 4 ) {
    errorMessageAdderFunction("Hasło musi składać się przynajmniej z 4 znaków");
  } 
  
  if (password.replace(/\s/g,'').length !== password.length ) {
    errorMessageAdderFunction("Hasło nie może posiadać białych znaków!");
  }
}



exports.validateNewUserData = (req, res, next) => {
  // console.log("jestem jestem jestem jestem jestem jestem jestem jestem jestem ");
  // const error = new Error("TEST<br />TEST");
  // error.status = 404;
  // next(error);
  var errorMessage = '';

  req.body.username = req.body.username.trim() ;
  if ( req.body.username === '' ) {
    errorMessage += `Nazwa użytkownika nie może być pusta!` + html_new_line;
  }

  req.body.email = req.body.email.trim();
  if( req.body.email === '' ) {
    errorMessage += `Mail nie może być pusty!` + html_new_line;
  } else if ( !validateGivenEmail(req.body.email) ) {
    errorMessage += `Email ${req.body.email} jest nieprawidłowy` + html_new_line;
  }

  
  if( req.body.password === '' ) {
    errorMessage += `Hasło nie może być puste!` + html_new_line;
  } else if ( !sufficientPasword(req.body.password) ) {
    addPasswordRequirementsMessages(req.body.password, (message) => {
      errorMessage += message + html_new_line;
    });
  }

  if( errorMessage.length === 0 ) {
    next();
  }else {
    const error = new Error(errorMessage);
    error.status = 500;
    next(error);
  }
}

