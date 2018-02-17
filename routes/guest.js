const express = require('express');
const router = express.Router();

const dbController = require('../controllers/databaseConnectionController');
const helpers = require('../helpers/helpers');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/wall/:user',
dbController.get_user_images_to_request,
(req, res) => {
  res.render('user_wall', { images: req.body.images, name_of_wall_owner: req.params.user , message: req.query.message, guest: true });
}
);


router.get('/category/wall/:category_name',
  dbController.get_images_from_given_category_to_request,
  (req, res) =>{
    res.render('user_wall', { images: req.body.images, name_of_wall_owner: req.params.category_name, guest: true });
  }
);


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
  res.render('image-info', { images: req.body.images, name_of_wall_owner: req.params.user , message: req.query.message, guest: true });
});


module.exports = router;