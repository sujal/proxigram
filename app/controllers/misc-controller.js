
/*
 * GET home page.
 */

module.exports = function (app) {

  app.get('/', function(req, res){
    if (req.isAuthenticated()) {
      res.redirect('/code');
    } else {
      res.render('misc/index', { title: 'A simple API for all of your photos' });
    }
  });

  app.get('/about', function(req, res){
    res.render("misc/about", { title: 'About ChromaticLove' });
  });

  app.get('/faq', function(req, res){
    res.render("misc/faq", { title: "FAQ" });
  });
}
