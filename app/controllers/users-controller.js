module.exports = function(app) {
  
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
  
  app.get('/code', ensureAuthenticated, function(req, res) {
    res.render('users/code', { title: 'Your Dashboard' })
  });
}