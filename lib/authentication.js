
// this isn't used AFAICT

// 
// exports.ensureAuthenticated = function (req, res, next) {
//   if (req.isAuthenticated()) { return next(); }
//   res.redirect('/step1');
// }
// 
// exports.ensureAdmin = function(req, res, next) {
//   if (req.user !== undefined && req.user.admin == true) { return next(); }
//   res.redirect("/");
// }