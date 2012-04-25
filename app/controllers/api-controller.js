
module.exports = function(app) {
  
  app.get('/api/photos', 
    // need to do a token check, not a passport auth check
    // passport.authenticate('instagram', { failureRedirect: '/' }), 
    function(req, res){
      res.render('api/photos', { });
    });
  
}