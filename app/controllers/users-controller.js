
module.exports = function(app) {
  
  app.get('/auth/instagram',
    passport.authenticate('instagram'),
    function(req, res){
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
    });
    
  app.get('/auth/instagram/callback', 
    passport.authenticate('instagram', { failureRedirect: '/step1' }),
    function(req, res) {
      res.redirect('/step2');
    });
    
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  
  app.get('/code', ensureAuthenticated, function(req, res) {
    res.render('users/code', { title: 'Step 2: Grab your JS and Go!' })
  });
  
}