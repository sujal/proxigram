
/*
 * GET home page.
 */

module.exports = function (app) {
  
  app.get('/', function(req, res){
    res.render('misc/index', { title: 'A simple way to get your Instagram photos' });
  });
  
  app.get('/about', function(req, res){
    res.render("misc/about", { title: 'About Proxigram' });
  });
  
  app.get('/faq', function(req, res){
    res.render("misc/faq", { title: "FAQ" });
  });
}
