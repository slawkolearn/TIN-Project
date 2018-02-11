const mkdir = require('mkdirp');

exports.createUserFolder = (req, res, next) => {
  console.log("localdiskcontroller:");
  console.log(req.body.username);
  mkdir(`./uploads/${req.body.username}`);
  next();
};