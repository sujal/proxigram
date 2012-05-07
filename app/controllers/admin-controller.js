var util = require('util');
var ImageList = mongoose.model("ImageList");
var User = mongoose.model("User");

module.exports = function(app) {
  
  app.get('/admin/instagram/subscribe', ensureAuthenticated, ensureAdmin, function(req, res){
    ImageList.subscribeForUserNotifications("instagram", function(err, data){
      if (err == null) {
        console.log("SUBSCRIBED: " + data );        
      } else {
        console.log("SUBSCRIBE FAIL: " + err + "\n" + util.inspect(data) + "\n" );                
      }
      res.render('admin/instagram/subscribe', { err: err, data: util.inspect(data), title: "Activate Instagram Subs" });
    })
  });

  // flickr has a per user subscribe call, so this doesn't make sense (or can't
  // use the same branching logic)
  // app.get('/admin/flickr/subscribe', ensureAuthenticated, ensureAdmin, function(req, res){

  app.get('/admin/facebook/subscribe', ensureAuthenticated, ensureAdmin, function(req, res){
    
    ImageList.subscribeForUserNotifications("facebook", function(err, data){
      if (err == null) {
        console.log("SUBSCRIBED: " + data );        
      } else {
        console.log("SUBSCRIBE FAIL: " + err + "\n" + util.inspect(data) + "\n" );                
      }
      res.render('admin/instagram/subscribe', { err: err, data: util.inspect(data), title: "Activate Facebook Subs" });
    })
    
  });
  
  app.get('/admin(/index)?', ensureAuthenticated, ensureAdmin, function(req, res){
    res.render('admin/index', { title: "Admin Section" });    
  });
  
  app.get('/admin/migrations/schema_change', ensureAuthenticated, ensureAdmin, function(req, res){
    
    var names = [];
    
    User.find({},function(err, users) {
      var total = users.length;
      for (var i = total - 1; i >= 0; i--){
        var user = users[i];
        if (user.tokens.instagram.account_id == null) {
          user.tokens.instagram.account_id = user.instagram_id;
          user.tokens.instagram.display_name = user.displayName;
          user.tokens.instagram.token = user.oauth_token;
          user.save(function(err, user){
            if (err) {
              throw err;
            }
            names.push(user.displayName);
            total--;
            if (total <= 0)
            {
              // means that everything has returned
              console.log("saved "+user.tokens.instagram.display_name);
              res.send({meta: 200, data: names}, 200);
              return;
            }
          });
        } else {
          total--;
          console.log("account already migrated (or at least had something in the tokens collection)");
          // special case if there's only one user
          if (total <= 0) {
            res.send({meta: 200, data: names}, 200);
          }
        }
      };
    });
  });
  
}