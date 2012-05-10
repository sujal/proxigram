module.exports = function(app) {
  
  app.get('/docs', function(req, res){
    res.render('docs/index', { title: "API Documentation" });
  });
  
  app.get('/docs/photos', function(req, res){
    res.render('docs/photos', { title: "Documentation for /api/photos" });
  });
  
  app.get('/docs/jquery-plugin', function(req, res){
    res.render('docs/jquery-plugin', { title: "Documentation for the jQuery plugin" });
  });
  
}