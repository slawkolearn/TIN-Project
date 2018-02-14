const express = require('express');
const router = express.Router();
// do uploadu obrazków
const multer = require('multer');

// kontrolery do obsługi bazy danych i systemu plików na serwerze
const dbController = require('../controllers/databaseConnectionController');


// wyświetl formularz do wysyłania obrazków
router.get('/', (req, res) => {
  res.render('uploadImage');
});

// logika zapisywania obrazków
router.post('/',  
  (req, res, next) => {
    console.log("uploading...");
    console.log(`uploads/${req.cookies.username}`);
    // configuracja multera
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        // tu będzie (w tym folderze) zapisany plik
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
        // tu ustawiamy nazwę pliku taka jaka będzie na serwerze..
        cb(null, imageName);
      }
    });

    // console.log(req.body);

    // ta linia wzięta z dokumentacji 
    var upload = multer({ storage: storage }).single("image");

    upload(req, res, function (err) {
      if (err) {
        // TODO:SL obsłuż błąd przy uploadowaniu pliku
        // An error occurred when uploading
        return
      }

      next();
    })
  },
  // OK 
  // dodaj obrazek do bazy danych (sciezke)
  dbController.add_new_picture_entry,
  (req, res) => {
    // powiadom o sukcesie
    var message = "Obrazek przesłany prawidłowo";
    res.redirect(`/?message=${message}`);
  }
);

// -------


module.exports = router;