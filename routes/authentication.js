const express = require('express');
const router = express.Router();

const dbController = require('../controllers/databaseConnectionController');

router.get('/hello', (req, res) => {
  res.render('hello');
});

router.post('/authenticateUser', 
  dbController.check_if_user_exists,
  dbController.check_user_password,
  (req, res) => {
    res.cookie('username', req.body.username);
    res.redirect('/');
  }
);

router.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/hello');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', 
  dbController.create_new_user,
  (req, res) => {
    console.log(req.body);
    res.redirect('/hello');
  }
);


module.exports = router;