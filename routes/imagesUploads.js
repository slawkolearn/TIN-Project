const express = require('express');
const router = express.Router();
const multer = require('multer');

const dbController = require('../controllers/databaseConnectionController');

router.get('/', (req, res) => {
  res.render('uploadImage');
});

router.post('/',  
  (req, res, next) => {
    console.log("uploading...");
    // TODO:SL add pic in the PICTURES table
    // and assign the picture owner
    console.log(`uploads/${req.cookies.username}`);
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, `uploads/${req.cookies.username}`);
      },
      filename: function (req, file, cb) {
        // TODO:SL check if there will be a problem with saving the file with polish (and other) characters
        var imageName = req.body.name;
        if( imageName === '' || !imageName ){
          imageName = 'image';
        } 
        imageName += '-' + Date.now() + '.jpg';
        req.body.location_on_server = `/${req.cookies.username}/${imageName}`;
        cb(null, imageName);
      }
    });

    console.log(req.body);

    var upload = multer({ storage: storage }).single("image");

    upload(req, res, function (err) {
      if (err) {
        // An error occurred when uploading
        return
      }

      next();
    })
  },
  // Everything went fine
  // here you add picture to database
  dbController.add_new_picture_entry,
  (req, res) => {
    var message = "Obrazek przesłany prawidłowo";
    res.redirect(`/?message=${message}`);
  }
);

// -------


module.exports = router;