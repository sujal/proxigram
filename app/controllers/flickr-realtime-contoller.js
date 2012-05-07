var User = mongoose.model("User")
  , ImageList = mongoose.model("ImageList")
  , PuSHHelper = require('node-push-helper').PuSHHelper;

module.exports = function (app) {

  // a GET request will be a challenge query
  app.get('/flickr/realtime', function(req, res){
    PuSHHelper.handshake(req, res);
  });
  
  // this is where Instagram will send updates (using POST)
  app.post('/flickr/realtime', PuSHHelper.check_signature, function(req, res){
    
  });
}
