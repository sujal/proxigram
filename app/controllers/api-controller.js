var moment = require('moment');

var ImageList = mongoose.model("ImageList");

module.exports = function(app) {
  
  app.get('/api/photos',
    passport.authenticate('token-auth'),
    // need to do a token check, not a passport auth check
    // passport.authenticate('instagram', { failureRedirect: '/' }), 
    function(req, res){
      user = req.user

      ImageList.instagramPhotosForUser(user, function(err, imageList){
        res.render('api/photos', { imageList: imageList, layout: false });
      });
    });
  
}