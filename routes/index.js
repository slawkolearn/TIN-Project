const express = require('express');
const router = express.Router();

const helpers = require('../helpers/helpers');

router.use(helpers.add_calling_user_to_locals);

router.get('/', (req, res) => {
  const username = req.cookies.username;
  if( username ){
      console.log(req.query.message);
      res.render('index',  { username: req.cookies.username, message: req.query.message } );
  }else{
      res.redirect('/hello');
  }
});

module.exports = router;