var User = mongoose.model("User")
  , util = require('util')
  , ImageList = mongoose.model("ImageList")
  , PuSHHelper = require('node-push-helper').PuSHHelper;

module.exports = function (app) {

  // a GET request will be a challenge query
  app.get('/flickr/realtime', function(req, res){
    PuSHHelper.handshake(req, res);
  });
  
  // this is where Flickr will send updates (using POST)
  // does flickr send the signature?
  app.post('/flickr/realtime', function(req, res){

    var notifications = req.body;
    console.log("FLICKR NOTIFICATION: " + util.inspect(notifications));
    
    User.findById(params["user_id"], function(err, user) {
      // fire this, but don't hold up the reply to flickr
      ImageList.refreshFeedForUserProvider(user, "flickr", function(err, imageList) {
        if (err) {
          console.log("ERROR: Flickr notifiication had an error refreshing the feed: " + err);
        } else {
          console.log("SUCCESS: Flickr notification successfully refreshed feed. New timestamp is: " + moment(imageList.updated_at).format('MM/DD/YYYY h:mm:ss a'));
        }
      });
    });
    
    // we can tell Flickr we're good to go because updates will happen async
    res.send({meta: 200, message: "Received and understood."}, 200);
  });
  
  app.get('/flickr/subscriptions', ensureAuthenticated, function(req, res){
    var client = req.user.flickrClient();
    if (client) {
      client.executeAPIRequest("flickr.push.getSubscriptions", {
                                }, true, function(err, response){
                                  if (err) { throw err; }
                                  console.log("result is " + response);
                                  res.send( response, 200);
                                });
    }
    
  })
}
