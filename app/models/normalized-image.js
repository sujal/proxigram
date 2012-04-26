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
  image_source: {
    itunes_url: TrimmedString,
    name: TrimmedString,
    website: TrimmedString
  },
  metadata: {
    created_time: { type: Date },
    from_user: {
      full_name: TrimmedString,
      user_id: TrimmedString,
      profile_picture: TrimmedString,
      username: TrimmedString
    },
    metadata_id: TrimmedString,
    text: TrimmedString
  },
  comment_count: { type: Number, default: 0 },
  content_type: TrimmedString,
  created_time: { type: Date },
  filter: TrimmedString,
  images: {
    low_resolution: ImageTag,
    standard_resolution: ImageTag,
    thumbnail: ImageTag
  },
  likes_count: { type: Number, default: 0 },
  link: TrimmedString,
  location: {
    location_id: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number },
    name: TrimmedString
  },
  owner: {
    displayName: TrimmedString,
    user_id: TrimmedString,
    profile_picture: TrimmedString,
    username: TrimmedString,
  },
  source_id: TrimmedString,
  tags: [String],
  raw_json: {}
});

NormalizedImage.plugin(simpleTimestamps);

NormalizedImage.methods.populateFromMediaData = function(media_data)  {
  
  this.raw_json = media_data;
  
  if (media_data.attribution != null) {
    this.image_source = {
      itunes_url: media_data.attribution,
      name: media_data.attribution.itunes_url,
      website: media_data.attribution.website
    };
  }
  if (media_data.caption != null) {
    this.metadata = {
      created_time: new Date(Number(media_data.caption.created_time)*1000),
      from: {
        full_name: media_data.caption.from.full_name,
        user_id: media_data.caption.from.id,
        profile_picture: media_data.caption.from.profile_picture,
        username: media_data.caption.from.username
      },
      metadata_id: media_data.caption.id,
      text: media_data.caption.text
    };
  }
  if (media_data.comments != null) {
    this.comment_count = media_data.comments.count;
  }
  this.content_type = media_data.type;
  this.created_time = new Date(Number(media_data.created_time)*1000);
  this.filter = media_data.filter;
  this.images = {
    low_resolution: media_data.images.low_resolution ,
    standard_resolution: media_data.images.low_resolution ,
    thumbnail: media_data.images.thumbnail
  };
  if (media_data.likes != null) {
    this.likes_count = media_data.likes.count;
  }
  this.link = media_data.link;
  if (media_data.location != null) {
    this.location = {
      location_id: media_data.location.id,
      latitude: media_data.location.latitude,
      longitude: media_data.location.longitude,
      name: media_data.location.name
    }
  }
  this.source_id = media_data.id;
  this.tags = media_data.tags;
}

mongoose.model('NormalizedImage', NormalizedImage);
