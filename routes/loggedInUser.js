const express = require('express');
const router = express.Router();

const dbController = require('../controllers/databaseConnectionController');
const helpers = require('../helpers/helpers');


router.get('/wall/:user', 
  dbController.get_user_images_to_request,
  (req, res) => {
    console.log("WHAT I HAVE:");
    console.log(req.body.images);
    //console.log(req.body.images[0].location_on_server);
    res.render('user_wall', { images: req.body.images, name_of_wall_owner: req.params.user , message: req.query.message });
  }
);

router.get('/showUsers', 
  dbController.get_registered_users_to_request,
  (req, res) => {
    console.log("users in requests.body:");
    console.log(req.body.users);
    res.render('registered_users.pug', { registered_users: req.body.users });
  }
);

router.post('/rate/:whos/:what/:how', 
  dbController.rate_picture,
  (req, res) => {
    console.log(req.originalUrl);
    res.redirect(`/logged/wall/${req.params.whos}?message=${req.body.message}`);
  }
);

// helpers



module.exports = router;