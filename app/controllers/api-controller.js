
module.exports = function(app) {
  
  app.get('/api/photos', function(req, res){
    res.render('api/photos', { });
  });
  
}