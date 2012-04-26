
exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/step1');
}

exports.authenticateViaToken = function(req, res, next) {
  
}