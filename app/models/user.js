var crypto = require("crypto");

var generateAPIKey = function(spec) {
  if (spec == null) { spec = {} };
  var method = spec.method || "sha1";
  var encoding = spec.encoding || "hex";
  var bytes = spec.bytes || 2048;
  return crypto.createHash(method).update(crypto.randomBytes(bytes)).digest(encoding);
}

var ServiceToken = {
  token: {
    type: String,
    trim: true
  },
  account_id: {
    type: String,
    trim: true
  },
  display_name: {
    type: String,
    trim: true
  },
  raw_metadata: {}
}

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
  displayName: {
    type: String,
    trim: true
  },
  name: {
    familyName: {
      type: String,
      trim: true
    },
    givenName: {
      type: String,
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    }
  },
  profile_picture: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  external_counts: {
    instagram: {
      media: {
        type: Number,
        default: 0
      },
      follows: {
        type: Number,
        default: 0
      },
      followed_by: {
        type: Number,
        default: 0
      }
    }
  },
  oauth_token: {
    type: String,
    trim: true
  },
  tokens: {
    instagram: ServiceToken,
    flickr: ServiceToken,
    facebook: ServiceToken
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
    trim: true,
    default: generateAPIKey
  },
  admin: {
    type: Boolean,
    default: false
  }
});

User.index({"tokens.instagram.account_id": 1}, {unique: true, sparse: true});
User.index({"tokens.flickr.account_id": 1}, {unique: true, sparse: true});
User.index({"tokens.facebook.account_id": 1}, {unique: true, sparse: true});


User.plugin(simpleTimestamps);

User.methods.generateAPIKey = generateAPIKey;
User.methods.token_for_provider_id = function(provider_name, provider_account_id) {

  for (var i = this.tokens[provider_name].length - 1; i >= 0; i--){
    var service_token = this.tokens[provider_name][i];
    if (service_token.account_id == provider_account_id) {
      return service_token;
    }
  };
  return null;
}

mongoose.model('User', User);
