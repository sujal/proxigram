var moment = require('moment');

var ImageTag = {
  height: { type: Number },
  width: { type: Number },
  url: { type: String, trim: true }
};

var TrimmedString = {
  type: String,
  trim: true
};

// normalized image representation
var NormalizedImage = new mongoose.Schema({
  // maps to attribution in API
  // image_source: {
  //   itunes_url: TrimmedString,
  //   name: TrimmedString,
  //   website: TrimmedString
  // },
  // metadata: {
  //   created_time: { type: Date },
  //   from_user: {
  //     full_name: TrimmedString,
  //     user_id: TrimmedString,
  //     profile_picture: TrimmedString,
  //     username: TrimmedString
  //   },
  //   metadata_id: TrimmedString,
  //   text: TrimmedString
  // },
  user_id: {type: mongoose.Schema.ObjectId, ref: 'User'},
  provider: TrimmedString,
  visible: {type: Boolean, default: true },
  
  caption: TrimmedString,
  description: TrimmedString,
  comment_count: { type: Number, default: 0 },
  content_type: TrimmedString,
  created_time: { type: Date },       // time added to service (upload time on flickr)
  taken_time: { type: String },         // time photo taken
  filter: TrimmedString,
  images: {
    low_resolution: ImageTag,         // 320 max side (driven by Instagram's sizes, 306)
    standard_resolution: ImageTag,    // 640 max side (driven by Instagram's sizes, 612)
    thumbnail: ImageTag,              // 150 max side (driven by Instagram's sizes, 150)
    large: ImageTag                   // 1600 max side
  },
  likes_count: { type: Number, default: 0 },
  link: TrimmedString,
  location: {
    location_id: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number },
    name: TrimmedString
  },
  source_user: {
    bio: TrimmedString,
    full_name: TrimmedString,
    id: TrimmedString,
    profile_picture: TrimmedString,
    username: TrimmedString,
    website: TrimmedString
  },
  source_id: TrimmedString,
  tags: [String],
  raw_json: {}
});

NormalizedImage.index({ user_id: 1, provider: 1, source_id: 1 }, { unique: true });
NormalizedImage.index({ user_id: 1, visible: 1, created_time: -1 }, { });

NormalizedImage.plugin(simpleTimestamps);

NormalizedImage.methods.populateFromInstagramMediaData = function(media_data)  {
  this.raw_json = media_data;
  this.provider = "instagram";
  this.visible = true;

  if (media_data.caption != null) {
    this.caption = media_data.caption.text
  }
  if (media_data.comments != null) {
    this.comment_count = media_data.comments.count;
  }
  this.content_type = media_type_for_value(media_data.type);
  this.created_time = new Date(Number(media_data.created_time)*1000);
  this.filter = media_data.filter;
  this.images = {
    low_resolution: media_data.images.low_resolution ,
    standard_resolution: media_data.images.standard_resolution,
    thumbnail: media_data.images.thumbnail ,
    large: media_data.images.low_resolution
  };
  if (media_data.likes != null) {
    this.likes_count = media_data.likes.count;
  }
  this.link = media_data.link;
  if (media_data.location != null) {
    this.location = media_data.location;
  }
  this.source_user = media_data.user;
  this.source_id = media_data.id;
  this.tags = media_data.tags;
}

NormalizedImage.methods.propulateFromFlickrMediaData = function(media_data) {
  this.raw_json = media_data;
  this.provider = "flickr";
  this.visible = true;
  
  if (media_data.description != null) {
    this.description = media_data.description._content;
  }
  this.caption = media_data.title;
  this.content_type = media_type_for_value(media_data.media);
  this.created_time = new Date(Number(media_data.dateupload)*1000);
  this.taken_time = media_data.datetaken;
  this.images = {
    large: {
      url: media_data.url_l,
      width: Number(media_data.width_l),
      height: Number(media_data.height_l)
    },
    standard_resolution: {
      url: media_data.url_z,
      width: Number(media_data.width_z),
      height: Number(media_data.height_z)
    },
    low_resolution: {
      url: media_data.url_n,
      width: Number(media_data.width_n),
      height: Number(media_data.height_n)
    },
    thumbnail: {
      url: media_data.url_q,
      width: Number(media_data.width_q),
      height: Number(media_data.height_q)
    }
  };
  this.link = "http://www.flickr.com/photos/" + media_data.owner + "/" + media_data.id;

  if (media_data.latitude != null && media_data.longitude != null) {
    this.location.latitude = media_data.latitude;
    this.location.longitude = media_data.longitude;
  }
  
  
  this.source_user = {};
  this.source_user.username = media_data.ownername;
  this.source_user.full_name = media_data.ownername;
  this.source_user.id = media_data.owner;
  this.source_user.profile_picture = "http://farm"+media_data.iconfarm+".staticflickr.com/"+
                                        media_data.iconserver+"/buddyicons/"+media_data.owner+".jpg";

  this.source_id = media_data.id;
  if (media_data.tags != null) {
    this.tags = media_data.tags.split(" ");    
  }  
};

function media_type_for_value(raw_value) {
  var result = null;
  switch (raw_value) {
    case "video":
      result = "video";
      break;
    case "photo":
    case "image":
    default: 
      result = "image";
      break;
  }
  return result;
}

NormalizedImage.statics.latestImagesForUser = function(user, options, cb) {

  if ('function' == typeof options) {
    cb = options;
    options = {};
  }

  if (typeof(options.limit) != 'number') {
    options.limit = 30;
  } else if (options.limit > 30) {
    options.limit = 30;
  }
    
  var myClass = this;
  this.find({user_id: user.id, visible: true}).sort('created_time', -1).limit(options.limit).exec(function(err, results){
    if (err) { cb(err, results); }
    console.log("results count = " + results.length);
    if (options.prevent_refresh !== true && (results === null || results.length == 0 || moment().diff(moment(results[0].updated_at)) > 86400000)) {
      ImageList.refreshFeedsForUser(user, function(err, imageLists){
        if (err) { 
          console.log("ERROR: error refreshing imagelists"); 
        } else {
          console.log("Autorefresh for "+ user.id);
        }
        options.prevent_refresh = true;
        return myClass.latestImagesForUser(user, options, cb);
      });
    } else {
      return cb(err, results);
    }
  });
  
};

// findAndModify helper method
NormalizedImage.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};


mongoose.model('NormalizedImage', NormalizedImage);
require('./image-list');
var ImageList = mongoose.model('ImageList');
