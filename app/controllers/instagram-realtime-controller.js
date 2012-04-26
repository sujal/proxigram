var User = mongoose.model("User")
  , ImageList = mongoose.model("ImageList");

module.exports = function (app) {
  
  // a GET request will be a challenge query
  app.get('/instagram/realtime', function(req, res){
    Instagram.subscriptions.handshake(request, response);
  });
  
  // this is where Instagram will send updates (using POST)
  app.post('/instagram/realtime', function(req, res){
    if (Instagram.subscriptions.verified(req)) {
      // loop through incoming updates and ping the API to update
      // the cached records
      var notifications = request.body;
      
      for (var i=0; i < notifications.length; i++) {
        var update = notifications[i];
        if (update["object"] == "user" && update["changed_aspect"] == "media") {
          User.findOne({instagram_id: update["object_id"]}, function(err, user){
            if (err == null) {
              ImageList.instagramPhotosForUser(user, {force_refresh: true}, function(err, imageList){
                if (err == null) {
                  // do nothing, I think?
                  console.log("SUCCESS refresh of feed for " + user.instagram_id + "/" + user.instagram_name);
                } else {
                  // fail
                  console.log("ERROR refreshing feed on notification: " + err);
                }
              })
            } else {
              // failed
              console.log("ERROR handling notification: " + err);
            }
          });
        }
      }; // end for loop
      
      // we can tell Instagram we're good to go because updates will happen async
      res.send({meta: 200, message: "Received and understood."}, 200);
      
    } else {
      res.send({meta: 403, message: "Verification failed"}, 403);
    }
  });
  
}