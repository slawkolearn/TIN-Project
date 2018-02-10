const express = require('express');
const router = express.Router();


router.get('/hello', (req, res) => {
  res.render('hello');
});

router.post('/', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/');
});

router.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/hello');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  console.log(req.body);
  res.redirect('/hello');
});


module.exports = router;