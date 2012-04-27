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
  provider_user_id: {
    type: String,
    trim: true
  },
  images: [NormalizedImage.schema],
  response_json: {} // doesn't include images
});

ImageList.index({ provider: 1, user_id: 1 }, { unique: true })
ImageList.index({ provider: 1, provider_user_id: 1 }, { unique: true })

ImageList.plugin(simpleTimestamps);

ImageList.statics.instagramPhotosForUser = function (user, options, cb) {
  
  if ('function' == typeof options) {
    cb = options;
    options = {};
  }
  
  console.log("I'm in instagramPhotosForUser");
  var myClass = this;
  
  this.findOne({ provider: "instagram", user_id: user.id }, function(err, imageList) {
    if (err == null) {
      if ( imageList == null || moment().diff(moment(imageList.updated_at)) > 86400000 || options.force_refresh === true ) {
        // didn't find it or it's old, call Instagram!
        if (imageList == null) {
          imageList = new myClass();
          imageList.provider = "instagram";
          imageList.user_id = user.id;
          imageList.provider_user_id = user.instagram_id;
        }

        myClass.refreshInstagramFeedForUserImageList(user, imageList, cb);

      } else {
        cb(null, imageList);
      } 
    } else {
      cb(err, imageList);
    }
  });
}

ImageList.statics.refreshInstagramFeedForUserImageList = function(user, imageList, cb) {
  
  Instagram.users.recent({ count: 30, user_id: user.instagram_id, access_token: user.oauth_token,
    complete: function(data, pagination){
      console.log("instagram call complete, data count is "+data.length);
      if (data != null) {
        
        var new_images = [];        
        for (var i=0; i < data.length; i++) {
          var nimage = new NormalizedImage();
          nimage.populateFromMediaData(data[i]);
          new_images.push(nimage);
          // console.log("pushed " + nimage.caption);
        };

        imageList.set("images", new_images);
        
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
  });
  
}

ImageList.statics.subscribeForUserNotifications = function (cb) {
  Instagram.users.subscribe({
    complete: function(data, pagination) {
      cb(null, data);
    },
    error: function(errorMessage, errorObject, caller) {
      cb(errorMessage, errorObject);
    }
  });
}

mongoose.model('ImageList', ImageList);
