const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/picappsite.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE , (err) => {
  if(err) {
    console.error(err.message);
  }
  console.log('Connected to the picappsite database');
}) ;

// dla generowania i sprawdzenia hasła
var bcrypt = require('bcrypt');
const saltRounds = 10;

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
        // TODO:SL przepisz to żeby przekazać błąd i przekierowywać na /login z błedem wyświetlanym
        var message;
        if(req.body.username === ''){
          message = 'Podaj nazwę użytkownika';
        }else{
          message =  `Użytkownik ${req.body.username} nie istnieje`;
        }
        res.render('login', {message: message , hide_login_button: true } ) ;
      }
    });
    console.log("finish checking users existance");
  });
};

exports.check_user_password = (req, res, next) => { 
  console.log("checking users password");
  console.log(req.body);

  db.serialize( () => {
     // TODO:SL check if password matches  
     // Load hash from your password DB.
     // załaduj hash hasła z bazy
    console.log("checking new password:" + req.body.password +":");
     db.get(`SELECT password FROM users WHERE username='${req.body.username}'`,
              (err, row) => {
                console.log("check_user_password pass check::");
                console.log(row);
                if( row ) {
                  // sprawdzamy podane hasło
                  bcrypt.compare(req.body.password, row.password, function(err, password_match) {
                    if(password_match){             
                      next();
                    }else{      
                                  
                      var message = '';
                      if(req.body.password === ''){
                        message = 'Hasło nie może być puste';
                      }else{
                        message =  `Hasło ${req.body.password} dla ${req.body.username} nie jest poprawne`;
                      }
                      res.render('login', { message: message, hide_login_button: true } );
                    }
                  });     
                }
              });
  });
}

// ----------------- creaters -----------------

exports.bind_picture_to_hashtag = (req, res, next) => {
  db.serialize( () => {
    db.run(`INSERT INTO picture_has_hashtag VALUES (${req.params.picture_id}, '${req.body.hashtag}');`,(err, row) => {
      console.log('done bind_picture_to_hashtag' );
      next();
    });
  });
};

exports.create_hashtag_table_entry_if_not_exists = (req, res, next) => {
  db.serialize( () => {
    db.run(`INSERT INTO hashtag VALUES ('${req.body.hashtag}')`,(err, row) => {
      next();
    });
  });
}

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
};

function add_new_user(new_user){
  db.serialize( () => {
    console.log("putting new password:" + new_user.password+":");
    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(new_user.password, salt, function(err, hash) {
          // Store hash in your password DB.
          if(err){
            console.log("error in hashing");
            console.log(err);
          }
          console.log("storing new user with password");
          console.log(hash);
          // Store hash in your password DB.
          var stmt = db.prepare(`INSERT INTO users VALUES(?,?,?,DateTime('now'))`);
          stmt.run(new_user.username, new_user.email, hash);
          stmt.finalize();
      });
   });

  });
}

function add_new_picture(new_picure){
  console.log("NEW PICTURE ADDED: ");
  console.log(new_picure);
  db.serialize( () => {
    var stmt = db.prepare(`INSERT INTO pictures (name, desc, date_added, location_on_server,rating, owner_id, category_name)  VALUES(?,?,DateTime('now'),?,0,?,?)`);
    stmt.run(new_picure.name, new_picure.desc, new_picure.location_on_server, new_picure.username, new_picure.category);
    stmt.finalize();
  });
}

// function add_new_userPictureRating(new_rating, next){
//   console.log("new_rating ADDED: ");
//   console.log(new_rating);
//   db.serialize( () => {
//     db.run(`INSERT INTO userPictureRating VALUES(?,?,DateTime('now',?)`,
//     [ new_rating.id, new_rating.username, new_rating.voteType ],
//     (err) => {
//       console.log("you already voted votedvotedvotedvotedvotedvotedvotedvotedvotedvotedvotedvotedvoted");
//       const error = new Error("Już głosowałeś na ten obrazek !! ");    
//       err.status = 404;
//       next(error);
//     });
//     // var stmt = db.prepare(`INSERT INTO userPictureRating VALUES(?,?,DateTime('now'))`);
//     // stmt.run(new_rating.id, new_rating.username);
//     // stmt.finalize();
//   });
// }


// ----------- getters -----------------------

exports.get_picture_to_request = (req, res, next) => {
  db.serialize( () => {
    db.get(`SELECT picture_id, name, desc, date_added, location_on_server, rating, owner_id, category_name FROM pictures WHERE picture_id=${req.params.picture_id}`,
    (err, row)  => {
      if(err){
        console.log("ERROR IN get_picture_to_request ");
      }
      console.log("get_picture_to_request row::");
      console.log(row);
      res.locals.image = row;
      console.log("req.locals.image.rating :" + res.locals.image.rating);
      next();
    });
  });
}

exports.get_hashtags_for_picture_to_res_locals = (req, res, next) => {
  var hashtags = [];
  db.serialize( () => {
    console.log(`SELECT hashtag_name FROM picture_has_hashtag WHERE picture_id=${req.params.picture_id}`);
    db.each(`SELECT hashtag_name FROM picture_has_hashtag WHERE picture_id=${req.params.picture_id}`,
  (err, row) => {
    console.log("Pushing hastag result");
    hashtags.push(row);
  },
  (err, number_of_rows) => {
    res.locals.hashtags = hashtags;
    next();
  });
  });
}

exports.get_positive_votes_for_picture_to_res_locals = (req, res, next) => {
  var positives_votes = 0;
  db.serialize( () => {
    console.log(`SELECT COUNT(*) AS positive_count FROM userPictureRating WHERE picture_id=${req.params.picture_id} AND voteType='positive'`);
    db.each(`SELECT COUNT(*) AS positive_count FROM userPictureRating WHERE picture_id=${req.params.picture_id} AND voteType='positive'`,
  (err, row) => {
    console.log("row get positives:::");
    console.log(row);
    res.locals.positive_count = row;
  },
  (err, number_of_rows) => {
    next();
  });
  });
}

exports.get_negative_votes_for_picture_to_res_locals = (req, res, next) => {
  var positives_votes = 0;
  db.serialize( () => {
    console.log(`SELECT COUNT(*) AS negative_count FROM userPictureRating WHERE picture_id=${req.params.picture_id} AND voteType='negative'`);
    db.each(`SELECT COUNT(*) AS negative_count FROM userPictureRating WHERE picture_id=${req.params.picture_id} AND voteType='negative'`,
  (err, row) => {
    console.log("row get negative:::");
    console.log(row);
    res.locals.negative_count = row;
  },
  (err, number_of_rows) => {
    next();
  });
  });
}

exports.get_images_from_given_category_to_request = (req, res, next) =>  {  
  var category_images = [];
  db.serialize( () => {
    db.each(`SELECT picture_id, name, desc, date_added, location_on_server, rating, owner_id, category_name FROM pictures WHERE category_name='${req.params.category_name}'`,
   (err, row) => {
      console.log("category_images::");
      console.log(row);     
      category_images.push(row);
    }, (err, number_of_rows) => {
      console.log("Returning:");
      console.log(category_images);
      req.body.images = category_images; 
      
      // przejdź po wszystkich obrazkach
      // i policz głosy negatywne i pozytywne


      next();

      // db.serialize( () => {
      //   console.log("user_images.length() = " + user_images.length);
      //   if(user_images.length === 0) next();
      //   user_images.forEach((image, index, arr) => {
      //     let picture_rating = 0;
      //     console.log(`SELECT COUNT* FROM userPictureRating WHERE picture_id=${image.picture_id} AND voteType='positive';`);
      //     db.get(`SELECT COUNT(*) FROM userPictureRating WHERE picture_id=${image.picture_id} AND voteType='positive';`, (err, row) => {
      //       if( row ){
      //         console.log(` positive for ${image.name}: `)
      //         console.log(row);
      //       };
      //       if( index + 1 >= arr.length ) next();
      //     });
      //   });
      //   // next();
      // });

      
    });

    console.log("Finishing get_user_images select sequence");
    
  });
}

exports.get_categories_to_res_locals = (req, res, next) => {
  console.log("getting categories:");
  var categories = [];
  db.serialize( () => {
    db.each(`SELECT * FROM category`, 
    (err, row) =>{
      console.log("category row:");
      console.log(row);
      categories.push(row);
    },
    (err, number_of_rows) => {
      res.locals.categories = categories;
      next();
    }
    );
  });
}

exports.get_user_images_to_request = (req, res, next) => {
  var user_images = [];
  db.serialize( () => {
    db.each(`SELECT picture_id, name, desc, date_added, location_on_server, rating, owner_id, category_name FROM pictures WHERE owner_id='${req.params.user}'`,
   (err, row) => {
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
      
      // przejdź po wszystkich obrazkach
      // i policz głosy negatywne i pozytywne


      next();

      // db.serialize( () => {
      //   console.log("user_images.length() = " + user_images.length);
      //   if(user_images.length === 0) next();
      //   user_images.forEach((image, index, arr) => {
      //     let picture_rating = 0;
      //     console.log(`SELECT COUNT* FROM userPictureRating WHERE picture_id=${image.picture_id} AND voteType='positive';`);
      //     db.get(`SELECT COUNT(*) FROM userPictureRating WHERE picture_id=${image.picture_id} AND voteType='positive';`, (err, row) => {
      //       if( row ){
      //         console.log(` positive for ${image.name}: `)
      //         console.log(row);
      //       };
      //       if( index + 1 >= arr.length ) next();
      //     });
      //   });
      //   // next();
      // });

      
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
      console.log("get_registered_users_to_request next() is called");
      next();
    });
  });
};

// ------------------ updaters --------------------

exports.rate_picture = (req, res, next) => {    
  var new_rating = {
    id: req.params.what,
    username: req.cookies.username,
    voteType: req.params.how
  };
  console.log(new_rating);
  console.log("staring rating picture:");
  db.serialize( () => {
    const stmt = `INSERT INTO userPictureRating VALUES(${new_rating.id},'${new_rating.username}',DateTime('now'),'${new_rating.voteType}');`;
    db.exec(stmt, (err) => {
     if(err){
       console.log(err.message);
      console.log("NIE UDAŁO SIĘ DODAĆ GŁOSU");
      req.body.message = "Już głosowałeś na ten obrazek";
      next();
     } else {
       console.log("UDAŁO SIĘ DODAĆ GŁOSU");
       req.body.message = "Dziękuję za oddany głos";  
      db.exec(`UPDATE pictures SET rating = rating ` + (
                              req.params.how === 'positive' ? '+' : '-'
                                           ) + `1 WHERE picture_id=${req.params.what}`);
       next();
     }
    });
  });
  // var new_rating = {
  //   id: req.params.what,
  //   username: req.cookies.username
  // };
  // let added_rating = add_new_userPictureRating(new_rating, next);
  // if(added_rating){ 
  //   db.serialize( () => {
  //     db.exec(`UPDATE pictures SET rating = rating ` + (
  //         req.params.how === 'positive' ? '+' : '-'
  //       ) + `1 WHERE id=${req.params.what}`);
  //   });
  // }
  // next();
}

//----------- database table oparations  ------------------------------
function create_users_table_if_not_exists(){
  console.log("Creating USERS table...");
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, joined TEXT NOT NULL);', (err) => {
      if(err) {
        console.log(err.message);
      }
    });
    console.log("done Creating USERS table...");
  });
}

function create_pictures_table_if_not_exists(){
  console.log("Creating PICTURES table...");
  db.serialize( () => {
    // TODO:SL add sqlite table connection with USERS and PICTURES (picture belongs to user)
    db.run('CREATE TABLE IF NOT EXISTS pictures (picture_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,desc TEXT, date_added TEXT NOT NULL, location_on_server TEXT NOT NULL, rating INTEGER, owner_id TEXT NOT NULL, category_name TEXT);', (err) => {
      if(err) {
        console.log('PICTURES table...');
      }
    });
    console.log("done Creating PICTURES table...");
  });
}

function create_userPictureRating_table_if_not_exists(){
  console.log("Creating userPictureRating table...");
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS userPictureRating (picture_id INTEGER NOT NULL, username TEXT NOT NULL, date_added TEXT NOT NULL, voteType Text NOT NULL, PRIMARY KEY (picture_id, username));');
    console.log("done Creating userPictureRating table...");
  });
}

function create_category_table_if_not_exists(){
  console.log("Creating CATEGORY table...");
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS category (name TEXT PRIMARY KEY NOT NULL, desc TEXT NOT NULL);', (err) => {
      if(err) {
        console.log(err.message);
      }
      var stmt = db.prepare(`INSERT INTO category VALUES (?, ?);`);
      var categories = [
        {name: "Natura", desc: "Obrazki związane z naturą"},
        {name: "Ludzie", desc: "Obrazki związane z ludźmi"},
        {name: "Technologia", desc: "Obrazki związane z technologią"},
        {name: "Ogólna", desc: "Obrazki bez kategorii"}
      ];
      for( let category of categories){
        stmt.run(category.name, category.desc);
      }
      stmt.finalize();
    });
    console.log("done Creating CATEGORY table...");
  });
}

function create_hashtag_table_if_not_exists(){
  console.log("Creating CATEGORY table...");
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS hashtag (name TEXT PRIMARY KEY NOT NULL);', (err) => {
      if(err) {
        console.log(err.message);
      }
    });
    console.log("done Creating hashtag table...");
  });
}

function create_picture_has_hashtag_table_if_not_exists(){
  console.log("Creating picture_has_hashtag table...");
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS picture_has_hashtag (picture_id INTEGER NOT NULL, hashtag_name TEXT NOT NULL, PRIMARY KEY(picture_id, hashtag_name));', (err) => {
      if(err) {
        console.log(err.message);
      }
    });
    console.log("done Creating CATEGORY table...");
  });
}

function create_user_follow_user_table_if_not_exists(){
  console.log("Creating user_follow_user table...");
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS user_follow_user (follower TEXT NOT NULL, user_followed TEXT NOT NULL, PRIMARY KEY(follower, user_followed));', (err) => {
      if(err) {
        console.log(err.message);
      }
    });
    console.log("done Creating user_follow_user table...");
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
  var app_tables = ['user', 'users','pictures', 'userPictureRating', 'category', 'hashtag', 'picture_has_hashtag', 'user_follow_user'];
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
    create_category_table_if_not_exists();
    create_hashtag_table_if_not_exists();
    create_user_follow_user_table_if_not_exists();
    create_picture_has_hashtag_table_if_not_exists();
    console.log('done');
  });
};

// TESTS

exports.runTestQuerry = () => {
  var user_images = [];
  db.serialize( () => {
    // var difference = 0;
    const stmt = `SELECT COUNT(*) AS TEST FROM userPictureRating WHERE picture_id=2 AND voteType="negative";SELECT COUNT(*) AS TEST2 FROM userPictureRating WHERE picture_id=2 AND voteType="positives";`;
    db.exec(stmt, (err, row) => {
      console.log(row);
    });
    // db.get('SELECT COUNT(*) AS TEST FROM userPictureRating WHERE picture_id=2 AND voteType="negative"', (err, row) => {
    //   console.log(row);
    //   let positives = row.TEST;
    //   db.get('SELECT COUNT(*) AS TEST2 FROM userPictureRating WHERE picture_id=2 AND voteType="positives"', (err, row) => {
    //     console.log(row);
    //     difference = positives - row.TEST2
    //   });
    // });
    // console.log(difference);

    // console.log("fist select pictures");
    // db.each('SELECT * FROM pictures WHERE owner_id="slawko"',(err, row) => {
    //   console.log(row);
    //   // user_images.push(row);
    //   console.log("selecting pictures");
    // });
    // console.log("done selecting pictures");
    
  
    // var stmt = `SELECT * FROM pictures WHERE owner_id='slawko'`;   
    // db.each(stmt, 
    // (err, row) => {
    //   console.log("row:");
    //   console.log(row);
    //   user_images.push(row);
    // },
    // (err, number_of_rows) => {
    //   console.log("user_Images:");
    //   console.log(user_images);
    //   stmt = `SELECT COUNT(*) FROM userPictureRating WHERE picture_id=3`;
    //   db.get(stmt, (err, row) => {
    //     console.log(`SELECT COUNT(*) AS TEST FROM userPictureRating WHERE picture_id=3`);
    //     console.log(row);
    //   });
    // });

  });
}

