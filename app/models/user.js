
var User = new mongoose.Schema({
  instagram_id: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true
  },
  instagram_name: {
    type: String,
    trim: true,
    index: true
  },
  provider: {
    type: String,
    trim: true,
    enum: ["instagram"]
  },
  full_name: {
    type: String,
    trim: true
  },
  profile_picture: {
    type: String,
    trim: true
  },
  oauth_token: {
    type: String,
    trim: true
  },
  notification_at: {
    type: Date
  },
  fetched_at: {
    type: Date,
    index: true
  },
  api_key: {
    type: String,
    unique: true,
    trim: true
  }
});

User.plugin(simpleTimestamps);

mongoose.model('User', User);
