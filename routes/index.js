const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const username = req.cookies.username;
  if( username ){
      res.render('index',  { username: req.cookies.username } );
  }else{
      res.redirect('/hello');
  }
});

module.exports = router;