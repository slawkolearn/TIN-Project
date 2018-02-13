
exports.add_calling_user_to_locals = (req, res, next) => {
  if( req.cookies.username ){
    res.locals.calling_user = req.cookies.username;
  }
  next();
};