var User = mongoose.model("User")
  , ImageList = mongoose.model("ImageList")
  , util = require('util')
  , PuSHHelper = require('node-push-helper').PuSHHelper;

module.exports = function (app) {

  // a GET request will be a challenge query
  app.get('/facebook/realtime', function(req, res){
    PuSHHelper.handshake(req, res);
  });
  
  // this is where Instagram will send updates (using POST)
  app.post('/facebook/realtime', PuSHHelper.check_signature, function(req, res){
    console.log("Data is " + util.inspect(req.body, false, null));
    res.send({meta: 200, message: "Received and understood."}, 200);
  });
}
