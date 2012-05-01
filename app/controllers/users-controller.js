var ImageList = mongoose.model("ImageList");
var moment = require('moment');

module.exports = function(app) {
  
 app.get('/code', ensureAuthenticated, function(req, res) {
    res.render('users/code', { title: 'Your Dashboard' });
  });
  
  app.get('/users/refresh', ensureAuthenticated, function(req, res) {
    ImageList.instagramPhotosForUser(req.user, {force_refresh: true}, function(err, imageList){
      if (err) {
        req.flash("error", "There was an error refreshing the feed.");
      } else {
        req.flash("info", "Successfully refreshed feed. New timestamp is: " + moment(imageList.updated_at).format('MM/DD/YYYY h:mm:ss a'));        
      }
      res.redirect('/code');      
    });
  });
  
  
  // AUTHENTICATION ROUTES

  // Conventions are as follows:
  // /auth/* routes are used for *creating* accounts and *login*
  // /connect/* routes are used for *adding* connections to existing accounts.
  //            This call requires login to make the connection.
  
  /* INSTAGRAM calls */
  
  app.get('/auth/instagram',
    passport.authenticate('instagram', {successFlash: true, failureFlash: true}),
    function(req, res){
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
    });
    
  app.get('/auth/instagram/callback', 
    passport.authenticate('instagram', { failureRedirect: '/step1', successFlash: true, failureFlash: true }),
    function(req, res) {
      res.redirect('/step2');
    });
    
  app.get('/logout', function(req, res){
    req.logout();
    req.flash('info', 'You have been successfully logged out.');
    res.redirect('/');
  });
  
  
};
