const express = require('express');
const router = express.Router();
const multer = require('multer');

const dbController = require('../controllers/databaseConnectionController');
const localDiskController = require('../controllers/localDiskController');

const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/test.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE , (err) => {
  if(err) {
    console.error(err.message);
  }
  console.log('Connected to the test database');
}) ;

router.get('/10times', (req, res) => {
  res.render('10times');
});



router.post('/10times', (req, res) => {
  const what = req.body.item;
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS tester (item TEXT)');
    var stmt = db.prepare('INSERT INTO tester VALUES (?)');


    for(let i = 0; i < 10; i++){  
      stmt.run(what + ' - ' + i);  
    }

    stmt.finalize();
   });

   console.log('redirect');
   res.redirect('/getdata');
});

router.get('/getdata', (req, res) => {
  db.serialize(() => {
    db.each('SELECT * FROM tester', (err, row) => {
      console.log(row.id + ' ' + row.item);
      console.log(row);
    });
  });

  res.send("ok");
});

function closeDatabase(){
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

// do not know how to close db connection when application is closing

// -- fileuploads tests

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/test1')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg')
  }
})

var upload = multer({ storage: storage }).single('upload');

router.get('/profile', (req, res) => {
  res.render('upload-test');
});

router.post('/profile',  (req, res) => {
  console.log("uploading...");
  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      return
    }

    // Everything went fine
    res.send("ok");
  })
});

// usuwanie bazy danych aplikacji

router.get('/clearDatabase', (req, res) => {
  dbController.clearAppDB();  
  dbController.createAppTables();

  res.send("ok");
});


// pokaż obrazek na serwerze
// ok
router.get('/showImages', (req, res) => {
  var imagesLocation = ['slawko/pieselek-1518454370722.jpg', 'slawko/pieselek-1518454370722.jpg'];
  res.render('image-test',  {  imagesLocation } );
});


router.get('/showTableContents/:table',
  (req, res) => {
    dbController.show_current_table_state(req.params.table);
   res.send("ok");
  }
);

router.get('/runsql', (req, res) => {
  dbController.runTestQuerry();
  res.send("ok");
});

module.exports = router;