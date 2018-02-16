const express = require('express');
const router = express.Router();

// kontrolery do obsługi bazy danych i systemu plików na serwerze
const dbController = require('../controllers/databaseConnectionController');
const localDiskController = require('../controllers/localDiskController');
const dataValidator = require('../validators/incomingDataValidator');

// dla ściezki /hello renderuj stronę powitalną
router.get('/hello', (req, res) => {
  res.render('hello');
});


// dla ścieżki /authenticateUser...
router.post('/authenticateUser', 
  // ...sprawdź czy user istnieje..
  dbController.check_if_user_exists,
  // ... sprawdź hasło ...
  dbController.check_user_password,
  // .. jak wszustko ok..
  (req, res) => {
    // ustaw cookie z wartością username dla indetyfikacji użytkonika podczas obługi apki
    res.cookie('username', req.body.username);
    // .. przekieruj na stronę główną
    res.redirect('/');
  }
);

// logika wylogowania
router.post('/logout', (req, res) => {
  // usuwamy cookie username i przekierowujemy na ścieżkę /hello
  res.clearCookie('username');
  res.redirect('/hello');
});

// dla ścieżki /register wywołania GET wyrenderuj stronę i ją przeslij
// strona z formularzem do rejestracji
router.get('/register', (req, res) => {
  res.render('register');
});

// TODO:SL dodaj przekierowanie do strony z formularzem kiedy użytkownik z username już istnieje
// logika obsługi rejestracji
router.post('/register',
  dataValidator.validateNewUserData,
  dbController.create_new_user,
  localDiskController.createUserFolder,
  (req, res) => {
    console.log(req.body);
    res.redirect('/hello');
  }
);


module.exports = router;