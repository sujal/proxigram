var util = require('util');
var ImageList = mongoose.model("ImageList");

module.exports = function(app) {
  
  app.get('/admin/instagram/subscribe', ensureAuthenticated, ensureAdmin, function(req, res){
    ImageList.subscribeForUserNotifications(function(err, data){
      if (err == null) {
        console.log("SUBSCRIBED: " + data );        
      } else {
        console.log("SUBSCRIBE FAIL: " + err + "\n" + util.inspect(data) + "\n" );                
      }
      res.render('admin/instagram/subscribe', { err: err, data: util.inspect(data), title: "Activate Instagram Subs" });
    })
  });
  
  app.get('/admin(/index)?', ensureAuthenticated, ensureAdmin, function(req, res){
    res.render('admin/index', { title: "Admin Section" });    
  });
  
}