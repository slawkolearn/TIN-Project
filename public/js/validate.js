// funkcja sparwdzająca czy string jest adresem email
function validateGivenEmail(emailToValidate){
	// \S+ - conajmniej jeden znak nie będący znakiem odstępu (white space)
	// posługując się znakami / / tworzony jest obiekt wyrażenia regularnego	
	// mój prosty regex :) - bo nie rozumiem tego powyżej ( nie przetestowałem :( )
	var REGEX_EMAIL = /\S+@\S+\.\S+/;
	return REGEX_EMAIL.test(emailToValidate);
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

  if ( !containsWhiteSpaces(password)) {
    errorMessageAdderFunction("Hasło nie może posiadać białych znaków!");
  }
}

function sufficientPasword(password){
  if( password.search(/[A-Z]/) < 0 ){
    return false;
  } else if ( password.search(/[0-9]/) < 0 ) {
    return false;
  } else if ( password.length < 4 ){
    return false;
  } else if( !containsWhiteSpaces(password) ){
    alert("return false");
    return false;
  }
  return true;
}



var registrationForm = document.forms.userRegistration;
var errorPanel = document.getElementById("errorParagraf");

function addErrorMessage(message) {
  // element br do dodawania nowej lini
  var brElement = document.createElement("br");
  errorPanel.appendChild(document.createTextNode(message));
  errorPanel.appendChild(brElement);
  
}


console.log(registrationForm);

registrationForm.register.onclick = () => {
  let result = true; // zakładamy że wszystko pójdzie po naszej myśli :)

  errorPanel.textContent = ""; // czyścimy zawartość errorParagraf

  console.log("jest");
  // najpierw nazwa użytkownika
  registrationForm.username.value = registrationForm.username.value.trim();
  if( registrationForm.username.value === '' ) {
    addErrorMessage("Nazwa użytkownika nie może być pusta!");
    result = false;
  }

  // mail
  registrationForm.email.value = registrationForm.email.value.toLowerCase();
  if( registrationForm.email.value === '' ) {
    addErrorMessage(`Mail nie może być pusty!`);
    result = false;
  }else if ( !validateGivenEmail(registrationForm.email.value) ) {
    addErrorMessage(`Mail ${registrationForm.email.value} nie jest prawidłowy!`);
    result = false;
  }

  // hasło użytkownika
  // TODO:SL jakieś minimanlne hasło może ??
  if ( !sufficientPasword(registrationForm.password.value ) ){
    addPasswordRequirementsMessages(registrationForm.password.value, addErrorMessage);
    result = false;
  }
  
  console.log(result);

  return result; // zwracamy true/false -> to z kolei zdeterminuje czy wyślemy dalej formularz czy nie
};

// required helpers - > figure out how to use the same functions on the server and client (like this helper function(s)

function containsWhiteSpaces(text){
  return text.replace(/\s/g,'').length !== text.length ;
}
