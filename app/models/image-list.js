require('./normalized-image');

var moment = require('moment');
var NormalizedImage = mongoose.model('NormalizedImage');

var ImageList = new mongoose.Schema({
  provider: {
    type: String,
    trim: true,
    enum: ["instagram"]
  },
  user_id: Schema.ObjectId,
  images: [NormalizedImage.schema],
  response_json: {} // doesn't include images
});

ImageList.index({ provider: 1, user_id: 1 }, { unique: true })

ImageList.plugin(simpleTimestamps);

ImageList.statics.instagramPhotosForUser = function (user, cb) {
  console.log("I'm in instagramPhotosForUser");
  var myClass = this;
  
  this.findOne({ provider: "instagram", user_id: user.id }, function(err, imageList) {
    if (err == null) {
      if ( imageList == null || moment().diff(moment(imageList.updated_at)) > 3600000 ) {
        // didn't find it or it's old, call Instagram!
        if (imageList == null) {
          imageList = new myClass();
          imageList.provider = "instagram";
          imageList.user_id = user.id;
        }
        Instagram.users.recent({ count: 30, user_id: user.instagram_id, access_token: user.oauth_token,
          complete: function(data, pagination){
            console.log("instagram call complete, data count is "+data.length);
            if (data != null) {

              imageList.images.forEach(function(p){
                p.remove();
              });
              
              data.forEach(function(item){
                var nimage = new NormalizedImage();
                nimage.populateFromMediaData(item);
                imageList.images.push(nimage);
              });
              
              imageList.save(function(err){
                if (!err) 
                { 
                  cb(null, imageList); 
                } else {
                  console.log("there was an error: " + err); 
                  cb(err, null) ;
                }
              });
            }
          },
          error: function(errorMessage, errorObject, caller) {
            console.log("there was an error getting our data: " + errorMessage + "|||" + errorObject + "$$$$" + caller);
            cb(errorMessage, null);
          }
        })
      } else {
        cb(null, imageList);
      } 
    } else {
      cb(err, imageList);
    }
  });
}

mongoose.model('ImageList', ImageList);
