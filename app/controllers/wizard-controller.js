
module.exports = function (app) {
  
  app.get('/step1', function(req, res){
    if (req.isAuthenticated()) {
      res.redirect('/code');
    } else {
      res.render('wizard/step1', { title: 'Step 1: Sign in to Instagram' })
    }
  });
  
  app.get('/step2', ensureAuthenticated, function(req, res){
    res.render('wizard/step2', { title: 'Step 2: Look at pretty photos' })
  });

}
