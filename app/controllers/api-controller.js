var moment = require('moment');

var ImageList = mongoose.model("ImageList");

module.exports = function(app) {
  
  app.get('/api/photos',
    passport.authenticate('token-auth'),
    // need to do a token check, not a passport auth check
    // passport.authenticate('instagram', { failureRedirect: '/' }), 
    function(req, res){
      var user = req.user
      var force_refresh = req.param("force_refresh", "false") == "true";
      ImageList.instagramPhotosForUser(user, {force_refresh: force_refresh}, function(err, imageList){
        var limit = Number(req.param("limit", "30"));
        if (limit < imageList.images.length) {
          imageList.images.splice(limit,imageList.images.length-limit);
        }
        if (req.param("include_raw", "no") == "no") {
          for (var i = imageList.images.length - 1; i >= 0; i--){
            imageList.images[i].raw_json = undefined;
          }          
        }
        res.send({meta: 200, data: imageList}, 200);
      });
    }
  );
  
}