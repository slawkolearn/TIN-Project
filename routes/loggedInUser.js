const express = require('express');
const router = express.Router();

const dbController = require('../controllers/databaseConnectionController');
const helpers = require('../helpers/helpers');


router.get('/wall/:user', 
  (req, res, next) => {
    if (!req.cookies.username) {
      res.redirect(`/guest/wall/${req.params.user}`);
    }else{
      next();
    }
  },
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

router.get('/category/wall/:category_name',
  dbController.get_images_from_given_category_to_request,
  (req, res) =>{
    res.render('user_wall', { images: req.body.images, name_of_wall_owner: req.params.category_name});
  }
);

router.post('/tag/:picture_id/:image_owner', 
dbController.create_hashtag_table_entry_if_not_exists,
dbController.bind_picture_to_hashtag,
(req, res) => {
  console.log("req.body:");
  console.log(req.body);
  console.log("req.params");
  console.log(req.params);
  res.redirect(`/logged/wall/${req.params.image_owner}`);
});

router.get('/info/image/:picture_id/:user', 
dbController.get_hashtags_for_picture_to_res_locals,
dbController.get_picture_to_request,
dbController.get_positive_votes_for_picture_to_res_locals,
dbController.get_negative_votes_for_picture_to_res_locals,
(req, res) => {
  console.log("req.body:");
  console.log(req.body);
  console.log("req.params");
  console.log(req.params);
  console.log(req.body.images);
  console.log("res.locals");
  console.log(res.locals);
  res.render('image-info', { images: req.body.images, name_of_wall_owner: req.params.user , message: req.query.message });
});

// helpers



module.exports = router;