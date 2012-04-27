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
        var include_raw = req.param("include_raw", "no");

        var outputObj = imageList.toObject();
        
        if (limit < outputObj.images.length) {
          outputObj.images.splice(limit,outputObj.images.length-limit);
        }
        if (include_raw == "no" || include_raw == "false" || include_raw === false) {
          for (var i = outputObj.images.length - 1; i >= 0; i--){
            outputObj.images[i].raw_json = undefined;
          }          
        }
        res.send({meta: 200, data: outputObj}, 200);
      });
    }
  );
  
}