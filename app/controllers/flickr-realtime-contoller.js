var User = mongoose.model("User")
  , util = require('util')
  , ImageList = mongoose.model("ImageList")
  , PuSHHelper = require('node-push-helper').PuSHHelper;

module.exports = function (app) {

  // a GET request will be a challenge query
  app.get('/flickr/realtime', function(req, res){
    PuSHHelper.handshake(req, res);
  });
  
  // this is where Instagram will send updates (using POST)
  app.post('/flickr/realtime', PuSHHelper.check_signature, function(req, res){
    var notifications = req.body;
    console.log("FLICKR NOTIFICATION: " + util.inspect(notifications));
    
    // we can tell Flickr we're good to go because updates will happen async
    res.send({meta: 200, message: "Received and understood."}, 200);
  });
}
