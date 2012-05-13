var User = mongoose.model("User")
  , ImageList = mongoose.model("ImageList")
  , moment = require('moment')
  , util = require('util')
  , _ = require('underscore')
  , PuSHHelper = require('node-push-helper').PuSHHelper;

module.exports = function (app) {

  // a GET request will be a challenge query
  app.get('/facebook/realtime', function(req, res){
    PuSHHelper.handshake(req, res);
  });
  
  // this is where Instagram will send updates (using POST)
  app.post('/facebook/realtime', PuSHHelper.check_signature, function(req, res){
    console.log("Data is " + util.inspect(req.body, false, null));
    
    var notifications = req.body;
    
    if (notifications['object'] == 'user') {
      var seen_in_this_batch = {};
      var entries = notifications.entry;
      for (var i=0; i < entries.length; i++) {
        var message = entries[i];
        // check if we already processed this user in this batch
        // since we're just pulling the latest batch of public photos,
        // we don't need to do this multiple times in one notification
        // push.
        if (seen_in_this_batch[message.uid] === undefined) {
          seen_in_this_batch[message.uid] = true;
          User.findOne({"tokens.facebook.account_id": message["uid"]}, function(err, user){
            if (err == null) {
              if (user !== null) {
                ImageList.refreshFeedForUserProvider(user, "facebook", function(err, imageList) {
                  if (err) {
                    console.log("ERROR: Flickr notification had an error refreshing the feed: " + err);
                  } else {
                    console.log("SUCCESS: Flickr notification successfully refreshed feed. New timestamp is: " + moment(imageList.updated_at).format('MM/DD/YYYY h:mm:ss a'));
                  }
                });                
              } else {
                console.log("ERROR: facebook uid from realtime notification not found: " + message["uid"]);
              }
            } else {
              // failed
              console.log("ERROR handling notification: " + err);
            }
          });
        }
      };
    }
    
    // don't wait for refreshes to finish.
    res.send({meta: 200, message: "Received and understood."}, 200);
  });
}
