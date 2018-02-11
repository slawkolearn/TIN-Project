const express = require('express');
const router = express.Router();
const multer = require('multer');

router.get('/', (req, res) => {
  res.render('uploadImage');
});

router.post('/',  (req, res) => {
  console.log("uploading...");
  console.log(`uploads/${req.cookies.username}`);
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${req.cookies.username}`);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
  });

  console.log(req.body);

  var upload = multer({ storage: storage }).single("image");

  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      return
    }

    // Everything went fine
    res.send("ok");
  })
});


module.exports = router;