var crypto = require("crypto"),
  Flickr = require('flickr').Flickr;

var generate_api_key = function(spec) {
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
  token_secret: {
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
  subscribed: {
    type: Boolean,
    default: false
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
    enum: ["instagram", "flickr", "facebook"]
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
  emails: [{}],
  gender: {
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
    default: generate_api_key
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

// Public: Used to generate an API key for the user. Done on create or if the key is cleared
//         because it is set as the default function for api_key.
//
// Examples: 
//            user.api_key = user.generate_api_key();
//
// Returns: a string containing the API Key
User.methods.generate_api_key = generate_api_key;

// Public: Disconnect from oauth by removing the entry for the provider name.
//
// provider_name: the name of the provider as used in the tokens array
// cb: callback - takes the arguments (err, user)
//
// Examples:
//            user.disconnect_oauth("instagram", function(err, user){ ... });
//  
// Returns: via callback, a user.
User.methods.disconnect_oauth = function (provider_name, cb) {
  this.set("tokens."+provider_name+".token", null);
  this.set("tokens."+provider_name+".token_secret", null);
  this.set("tokens."+provider_name+".account_id", null);
  this.set("tokens."+provider_name+".display_name", null);
  this.set("tokens."+provider_name+".subscribed", null);
  this.set("tokens."+provider_name+".raw_metadata", null);
  this.save(function(err){
    if (err) throw err;
    cb(null, this);
  });
};

// Public: create and set a service_token entry for the current user
//         based on the profile and accessToken sent in. Will overwrite
//         any previously set service token.
//
// provider: the name of the provider as used in the tokens array
// profile: the user profile object from the passport strategy
// accessToken: the token from the oAuth callback
//
// Examples:
//            user.set_token_from_profile("instagram", {...}, "1234567890");
//  
// Returns: nothing.
User.methods.set_token_from_profile = function(provider, profile, accessToken) {
  var token_secret = null;
  if (arguments.length == 4) {
    token_secret = arguments[3];
  }
    
  this.tokens[provider] = {
    token: accessToken,
    token_secret: token_secret,
    display_name: profile.displayName,
    account_id: profile.id,
    subscribed: false,
    raw_metadata: profile._json
  }
  
  if (this.tokens[provider].display_name == null || this.tokens[provider].display_name == "") {
    if (profile.username != null && profile.username != "") {
      this.tokens[provider].display_name = profile.username;
    }
  }
  
  // instagram automatically publishes realtime updates for authenticated users
  if (provider == "instagram") {
    this.tokens[provider].subscribed = true;
  }
}

// Public: offers a virtual to indicate whether user should go to verify
//         step or directly to dashboard
User.virtual('needs_verification')

// Public: offers a pre-configured Flickr client for the current user
//
// Examples
//
//  var client = current_user.flickrClient();
//
// Returns a Flickr object with this user's oauth tokens set. Must have the 
// node-flickr npm installed
User.methods.flickrClient = function()
{
  if (this.tokens.flickr) {
    return new Flickr(config.flickr.api_key, config.flickr.api_secret,
                      {"oauth_token": this.tokens.flickr.token, "oauth_token_secret":this.tokens.flickr.token_secret});
  }
  
  return null;
}

mongoose.model('User', User);
