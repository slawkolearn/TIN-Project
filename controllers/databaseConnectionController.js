const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/picappsite.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE , (err) => {
  if(err) {
    console.error(err.message);
  }
  console.log('Connected to the picappsite database');
}) ;

// -------------------------- checkers --------------------

exports.check_if_user_exists = (req, res, next) => {
  console.log("checking if user exists");
  db.serialize( () => {
    console.log("body:");
    console.log(req.body);
    show_current_table_state('users');
    console.log(req.body.username);
    db.get(`SELECT * FROM users WHERE username='${req.body.username}'`, (err, row) => {
      console.log("check_if_user_exists row:::");
      console.log(row); 
      console.log("finish querring1");      
      if( row ) {
        next();
      }else{
        // TODO:SL przepisz to żeby przekazać błąd i przekierowywać na /hello z błedem wyświetlanym
        res.render('hello', {error: `Użytkownik ${req.body.username} nie istnieje`} ) ;
      }
    });
    console.log("finish checking users existance");
  });
};

exports.check_user_password = (req, res, next) => { 
  console.log("checking users password");
  var passwordMatches = false;
  db.serialize( () => {
     // TODO:SL check if password matches 
     db.get(`SELECT * FROM users WHERE username='${req.body.username}' AND password='${req.body.password}'`,
              (err, row) => {
                console.log("check_user_password pass check::");
                console.log(row);
                if( row ) {
                  next();
                }else{
                  res.render('hello', { error: `Hasło dla ${req.body.username} nie jest poprawne`} );
                }
              });
  });
}

// ----------------- creaters -----------------

exports.create_new_user = (req, res, next) => {
  console.log("create_new_user new user: ");
  console.log(req.body);

  //create_user_table_if_not_exists();
  add_new_user(req.body);

  next();
};

exports.add_new_picture_entry = (req, res, next) => {
  req.body.username = req.cookies.username;
  console.log("username cookie: " + req.cookies.username);
  add_new_picture(req.body);
  next();
};function add_new_user(new_user){
  db.serialize( () => {
    var stmt = db.prepare(`INSERT INTO users VALUES(?,?,?,DateTime('now'))`);
    stmt.run(new_user.username, new_user.email, new_user.password);
    stmt.finalize();
  });
}

function add_new_picture(new_picure){
  console.log("NEW PICTURE ADDED: ");
  console.log(new_picure);
  db.serialize( () => {
    var stmt = db.prepare(`INSERT INTO pictures (location_on_server, name, desc,date_added, rating, owner)  VALUES(?,?,?,DateTime('now'),0,?)`);
    stmt.run(new_picure.location_on_server, new_picure.name, new_picure.desc, new_picure.username);
    stmt.finalize();
  });
}

function add_new_userPictureRating(new_rating){
  console.log("new_rating ADDED: ");
  console.log(new_rating);
  db.serialize( () => {
    var stmt = db.prepare(`INSERT INTO userPictureRating VALUES(?,?,DateTime('now'))`);
    stmt.run(new_rating.id, new_rating.username);
    stmt.finalize();
  });
}


// ----------- getters -----------------------

exports.get_user_images_to_request = (req, res, next) => {
  var user_images = [];
  db.serialize( () => {
    db.each(`SELECT * FROM pictures WHERE owner='${req.params.user}'`, (err, row) => {
      console.log("user images::");
      console.log(row);     
      console.log(" Setting voted negative flag");
      row.voted = 'negative';
      // db.run(`SELECT id FROM userPictureRating WHERE id=${row.id} AND username='${req.cookies.username}'`, (err, row) =>{
      //   console.log("found. Setting voted positive flag");
      //   row.voted = 'positive';
      // });
      user_images.push(row);
    }, (err, number_of_rows) => {
      console.log("Returning:");
      console.log(user_images);
      req.body.images = user_images;  

      db.serialize( () => {
        user_images.forEach((image, index, arr) => {
          console.log(`SELECT * FROM userPictureRating WHERE id=${image.id} AND username='${req.cookies.username}'`);
          db.run(`SELECT * FROM userPictureRating WHERE id=${image.id} AND username='${req.cookies.username}'`, (err, row) => {
            if( row ){
              image.voted = 'positive';
              console.log("positive set");
              console.log(row);
              console.log(err);
              console.log("Calling next in getting images");
            };
            if( index + 1 >= arr.length ) next()
          });
        });
        // next();
      });

      
    });

    console.log("Finishing get_user_images select sequence");
    
  });
};

exports.get_registered_users_to_request = (req, res, next) => {
  var users = [];
  db.serialize( () => {
    db.each(`SELECT username, email, joined FROM users`, 
    (err, row) => {
      users.push(row);
    }
    , (err, number_of_rows) => {
      req.body.users = users;
      next();
    });
  });
};

// ------------------ updaters --------------------

exports.rate_picture = (req, res, next) => {
  db.serialize( () => {
    db.exec(`UPDATE pictures SET rating = rating ` + (
      req.params.how === 'positive' ? '+' : '-'
    ) + `1 WHERE id=${req.params.what}`);
  });
  var new_rating = {
    id: req.params.what,
    username: req.cookies.username
  };
  add_new_userPictureRating(new_rating);
  next();
}

//----------- database table oparations  ------------------------------
function create_users_table_if_not_exists(){
  console.log("Creating USERS table...");
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY NOT NULL, email TEXT, password TEXT, joined TEXT)');
    console.log("done");
  });
}

function create_pictures_table_if_not_exists(){
  console.log("Creating PICTURES table...");
  db.serialize( () => {
    // TODO:SL add sqlite table connection with USERS and PICTURES (picture belongs to user)
    db.run('CREATE TABLE IF NOT EXISTS pictures (id INTEGER PRIMARY KEY AUTOINCREMENT, location_on_server TEXT NOT NULL,name TEXT NOT NULL, desc TEXT, date_added TEXT NOT NULL, rating INTEGER NOT NULL, owner TEXT NOT NULL)');
    console.log("done");
  });
}

function create_userPictureRating_table_if_not_exists(){
  console.log("Creating userPictureRating table...");
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS userPictureRating (id INTEGER NOT NULL, username TEXT NOT NULL, date_added TEXT NOT NULL, PRIMARY KEY (id, username))');
    console.log("done");
  });
}

exports.show_current_table_state = show_current_table_state;

function show_current_table_state(table){
  db.serialize( () => {
    console.log(`showing current state of ${table} table`);
    db.each(`SELECT * FROM ${table}`, (err, row) => {
      console.log("show_current_table_state row(s)::");
      console.log(row);
    });
    console.log("done");
  });
}

//clear all app tables

function dropAppTable (table_name) {
  console.log(`Deleting ${table_name}...`);
  db.serialize( () => {
    var stmt = db.prepare(`DROP TABLE IF EXISTS ${table_name}`);
    stmt.run();
    stmt.finalize();
    console.log("done");
  });
};

exports.clearAppDB = () => {
  console.log("Clearing app database...");
  var app_tables = ['user', 'users','pictures', 'userPictureRating'];
  for( let app_table of app_tables ) {
    dropAppTable(app_table);
  }
};

// create all app tables

exports.createAppTables = () => {
  console.log('Creating app database...');
  db.serialize( () => {
    create_users_table_if_not_exists();
    create_pictures_table_if_not_exists();
    create_userPictureRating_table_if_not_exists();
    console.log('done');
  });
};

