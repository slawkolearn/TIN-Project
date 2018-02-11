const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/picappsite.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE , (err) => {
  if(err) {
    console.error(err.message);
  }
  console.log('Connected to the picappsite database');
}) ;


exports.check_if_user_exists = (req, res, next) => {
  var exists = false;
  db.serialize( () => {
    console.log("body:");
    console.log(req.body);
    show_current_table_state('user');
    console.log(req.body.username);
    db.get(`SELECT * FROM user WHERE username='${req.body.username}'`, (err, row) => {
      console.log("row:::");
      console.log(row); 
      console.log("finish querring1");      
      if( row ) {
        next();
      }else{
        res.render('hello', {error: 'Użytkownik nie istnieje'} ) ;
      }
    });
    console.log("finish checking users existance");
  });
  console.log("checking if user exists");
};

exports.check_user_password = (req, res, next) => { 
  var passwordMatches = false;
  db.serialize( () => {
     // TODO:SL check if password matches 
     db.get(`SELECT * FROM user WHERE username='${req.body.username}' AND password='${req.body.password}'`,
              (err, row) => {
                console.log("pass check::");
                console.log(row);
                if( row ) {
                  next();
                }else{
                  res.render('hello', { error: `Hasło dla ${req.body.username} nie jest poprawne`} );
                }
              });
  });
  console.log("checking users password");
}

exports.create_new_user = (req, res, next) => {
  console.log("new user: ");
  console.log(req.body);

  create_user_table_if_not_exists();
  add_new_user(req.body);

  next();
};

//-----------
function create_user_table_if_not_exists(){
  db.serialize( () => {
    db.run('CREATE TABLE IF NOT EXISTS user (username TEXT, email TEXT, password TEXT, joined TEXT)');
  });
}

function add_new_user(new_user){
  db.serialize( () => {
    var stmt = db.prepare(`INSERT INTO user VALUES(?,?,?,DateTime('now'))`);
    stmt.run(new_user.username, new_user.email, new_user.password);
    stmt.finalize();
  });
}



//// ----- helpers

function show_current_table_state(table){
  db.serialize( () => {
  db.each(`SELECT * FROM ${table}`, (err, row) => {
    console.log(row);
   });
  });
}