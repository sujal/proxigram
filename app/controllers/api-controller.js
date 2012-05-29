var moment = require('moment');

var ImageList = mongoose.model("ImageList");
var NormalizedImage = mongoose.model("NormalizedImage");

module.exports = function(app) {
  
  app.get('/api/photos',
    passport.authenticate('token-auth'),
    // need to do a token check, not a passport auth check
    // passport.authenticate('instagram', { failureRedirect: '/' }), 
    function(req, res){
      var user = req.user
      var force_refresh = req.param("force_refresh", "false") == "true";
      var limit = Number(req.param("limit", "30"));
      var options = { "limit": Number(limit) }
      
      function imageListCallback(err, normalizedImages) {
        if (err) { throw err; }
        var outputObj = null;
        if (normalizedImages != null) {
          var include_raw = req.param("include_raw", "no");

          outputObj = {
            images: normalizedImages
          }
          
          if (normalizedImages.length > 0){
            outputObj.updated_at = normalizedImages[0].created_at;
            outputObj.provider = "blended";
            outputObj.providers = {};
            outputObj.user_id = user._id;
            
            if (user.tokens.instagram.token !== null) {
              outputObj.providers.instagram = {
                account_id: user.tokens.instagram.account_id,
                display_name: user.tokens.instagram.display_name
              }
            }
            if (user.tokens.flickr.token !== null) {
              outputObj.providers.flickr = {
                account_id: user.tokens.flickr.account_id,
                display_name: user.tokens.flickr.display_name
              }              
            }
            if (user.tokens.facebook.token !== null) {
              outputObj.providers.facebook = {
                account_id: user.tokens.facebook.account_id,
                display_name: user.tokens.facebook.display_name
              }
            }
          }

          if (limit < outputObj.images.length) {
            outputObj.images.splice(limit,outputObj.images.length-limit);
          }
          if (include_raw == "no" || include_raw == "false" || include_raw === false) {
            for (var i = outputObj.images.length - 1; i >= 0; i--){
              outputObj.images[i].raw_json = undefined;
            }          
          }          
        }
        res.send({meta: 200, data: outputObj}, 200);
      }
      
      
      if (force_refresh === true) {
        ImageList.refreshFeedsForUser(user, function(err, imageLists){
          if (err) { throw err; }
          if (imageLists != null) {
            NormalizedImage.latestImagesForUser(user, options, imageListCallback);
          }
        });
      } else {
        NormalizedImage.latestImagesForUser(user, options, imageListCallback);
      }
      
    }
  );
  
  app.post('/api/photo/:id/hide', passport.authenticate('token-auth'), function(req, res){
    var user = req.user;
    NormalizedImage.findAndModify({_id: mongoose.Types.ObjectId(req.params.id)},
      {},
      {'$set': { 'visible': 'false' }},
      {upsert: false, multi: false, safe: true, "new": true},
      function(err, image){
        if (err) { throw err; }
        if (image) {
          var result = {meta: 200};
          result.data = {};
          result.data.image = image;
          res.send(result, 200);
        } else {
          res.send({meta: 404, message: "photo not found"}, 404);
        }
      }
    );
  });
  
}