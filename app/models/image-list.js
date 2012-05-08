require('./normalized-image');

var moment = require('moment'),
    Flickr = require('flickr').Flickr;
    
var NormalizedImage = mongoose.model('NormalizedImage');

var ImageList = new mongoose.Schema({
  provider: {
    type: String,
    trim: true,
    "enum": ["instagram", "flickr", "facebook"]
  },
  user_id: Schema.ObjectId,
  provider_user_id: {
    type: String,
    trim: true
  },
  images: [NormalizedImage.schema],
  response_json: {} // doesn't include images
});

ImageList.index({ provider: 1, user_id: 1 }, { unique: true });
ImageList.index({ provider: 1, provider_user_id: 1 }, { unique: true });

ImageList.plugin(simpleTimestamps);


ImageList.statics.photosForUser = function(user, options, cb) {
  // TBD
};

ImageList.statics.instagramPhotosForUser = function (user, options, cb) {
  
  if ('function' == typeof options) {
    cb = options;
    options = {};
  }
  
  console.log("I'm in instagramPhotosForUser");
  var myClass = this;
  
  this.findOne({ provider: "instagram", user_id: user.id }, function(err, imageList) {
    if (err === null) {
      if ( imageList === null || moment().diff(moment(imageList.updated_at)) > 86400000 || options.force_refresh === true ) {
        // didn't find it or it's old, call Instagram!
        myClass.refreshInstagramFeedForUser(user, cb);
      
      } else {
        cb(null, imageList);
      } 
    } else {
      cb(err, imageList);
    }
  });
};


ImageList.statics.refreshFeedsForUser = function(user, cb) {
  
  for(var provider in user.tokens) {

    var service_token = user.tokens[provider];
    
    if (service_token !== null) {

      var refresh_func = null;

      switch (provider) {
        case "instagram":
          refresh_func = ImageList.refreshInstagramFeedForUser;
          break;
        case "flickr":
          refresh_func = ImageList.refreshFlickrFeedForUser;
          break;
        case "facebook":
          refresh_func = ImageList.refreshFacebookFeedForUser;
          break;
        default:
          console.log("No matching source found for " + service_token.provider);
          break;
      }

      refresh_func(user, function(err, imageList) {

      });
      
    }
  }
  
};

ImageList.statics.refreshInstagramFeedForUser = function(user, cb) {

  var myClass = this;

  if (user.tokens.instagram.token !== null) {
    this.findOne({ provider: "instagram", user_id: user.id }, function(err, imageList) {
      if (err === null) {
        if (imageList === null) {
          imageList = new myClass();
          imageList.provider = "instagram";
          imageList.user_id = user.id;
          imageList.provider_user_id = user.instagram_id;
        }

        Instagram.users.recent({ count: 30, user_id: user.tokens.instagram.account_id, access_token: user.tokens.instagram.token,
          complete: function(data, pagination){
            console.log("instagram call complete, data count is "+data.length);
            ImageList._populateImagesFromResponseAndSave(imageList, data, "instagram", cb);
          },
          error: function(errorMessage, errorObject, caller) {
            console.log("there was an error getting our data: " + errorMessage + "|||" + errorObject + "$$$$" + caller);
            cb(errorMessage, null);
          }
        });

        // cb(null, imageList);
      } else {
        cb(err, imageList);
      }
    });    
  } else {
    cb(new Error("unable to refresh: user is not connected to an Instagram account"), null);
  }
};

ImageList.statics.refreshFlickrFeedForUser = function(user, cb) {
  var myClass = this;
  var flickr_client = user.flickrClient();
  if (flickr_client && user.tokens.flickr.account_id !== null) {
    
    this.findOne({ provider: "flickr", user_id: user.id }, function(err, imageList) {
      if (err === null) {
        if (imageList === null) {
          imageList = new myClass();
          imageList.provider = "flickr";
          imageList.user_id = user.id;
          imageList.provider_user_id = user.tokens.flickr.account_id;
        }
        
        flickr_client.executeAPIRequest("flickr.people.getPublicPhotos", 
          {  user_id: user.tokens.flickr.account_id,
             extras: "description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o",
             per_page: 30
          },
          true,
          function(err, response) {
            if (err) { throw err; }
            var photos = response.photos.photo;
            if (!photos) {
              photos = [];
            }
            ImageList._populateImagesFromResponseAndSave(imageList, photos, "flickr", cb);
          }
        );
      }
    });
  
    
    
  } else {
    throw(new Error("Unable to create flickr client for user: " + util.inspect(user)));
  }
};

ImageList.statics.refreshFacebookFeedForUser = function(user, cb) {
  
};

ImageList.statics._populateImagesFromResponseAndSave = function (imageList, photoList, provider, cb) {
  if (photoList !== null) {

      var new_images = [];        
      for (var i=0; i < photoList.length; i++) {
        var nimage = new NormalizedImage();
        switch (provider) {
          case "instagram":
            nimage.populateFromInstagramMediaData(photoList[i]);
            break;
          case "flickr":
            nimage.propulateFromFlickrMediaData(photoList[i]);
            break;
          default:
            break;
        }
        new_images.push(nimage);
      }

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
};


ImageList.statics.subscribeForUserNotifications = function (provider, cb) {
  var subscribeFunc = null;
  switch (provider) {
      case "instagram":
        subscribeFunc = ImageList.subscribeForInstagramUserNotifications;
        break;
        // flickr is commented out because it's different - see comments below.
      // case "flickr":
      //   subscribeFunc = ImageList.subscribeForFlickrUserNotifications;
      //   break;
      case "facebook":
        subscribeFunc = ImageList.subscribeForFacebookUserNotifications;
        break;
      default:
        console.log("No matching source found for " + provider);
        break;
    }
    
    if (subscribeFunc !== null) {
      subscribeFunc(cb);
    }
};

ImageList.statics.subscribeForInstagramUserNotifications = function (cb) {
  Instagram.users.subscribe({
    complete: function(data, pagination) {
      cb(null, data);
    },
    error: function(errorMessage, errorObject, caller) {
      cb(errorMessage, errorObject);
    }
  });
};

// Flickr uses per-user subscribe settings - this won't work right.
// ImageList.statics.subscribeForFlickrUserNotifications = function (cb) {
//   
//   var client = new Flickr(process.env.FLICKR_API_KEY, process.env.FLICKR_API_SECRET);
// };

ImageList.statics.subscribeForFacebookUserNotifications = function (cb) {
};

mongoose.model('ImageList', ImageList);
