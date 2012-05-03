// PASSPORT Auth
var InstagramStrategy = require('passport-instagram').Strategy
    , FlickrStrategy = require('passport-flickr').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , BearerStrategy = require('passport-http-bearer').Strategy
    , util = require('util');
    
var User = mongoose.model('User');

function findOrCreateUserForOauthResponse(provider, accessToken, token_secret, user, profile, done) {
  if (user) {
    user.needs_verification = false;
    // if the accessToken != the existing token, update the record
    var service_token = user.tokens[provider];
    if (service_token == null) {
      throw new Error("Unexpected scenario - found user, but no matching token for Instagram provider. Unpossible!");
    }
    
    // pass by reference, basically, means this works without re-setting it.
    if (service_token.token != accessToken) {
      service_token.token = accessToken;
      user.save(function(err){
        if (err) { throw err }
        user.needs_verification = true;
        done(null, user);
      })
    } else {
      done(null, user);
    }

  } else {
    var new_user = new User();
    new_user.provider = provider;
    
    new_user.displayName = profile.displayName;
    new_user.name = profile.name;
    
    if (provider == "instagram") {
      new_user.instagram_id = profile.id;
      new_user.instagram_name = profile.username;      
      new_user.bio = profile._json.data.bio;
      new_user.website = profile._json.data.website;
      new_user.external_counts.instagram = profile._json.data.counts;
      new_user.profile_picture = profile._json.data.profile_picture;      
      new_user.oauth_token = accessToken;
    }
    
    if (provider == "facebook") {
      new_user.gender = profile.gender;
      new_user.website = profile.profileUrl;
      new_user.emails = profile.emails;
    }
    
    new_user.set_token_from_profile(provider, profile, accessToken, token_secret);

    new_user.needs_verification = true;
    
    new_user.save(function(err){
      if (err) { throw err; }
      done(null, new_user);
    });
  }
}


// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.

// This is the LOGIN version, not the connect version.
passport.use(new InstagramStrategy({
    clientID: config.instagram.client_id,
    clientSecret: config.instagram.client_secret,
    callbackURL: config.instagram.oauth_callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      User.findOne({"tokens.instagram.account_id": profile.id}, function(err, user){
        if (err) throw err;
        findOrCreateUserForOauthResponse("instagram", accessToken, null, user, profile, done);
      });
    });
  }
));

passport.use("instagram-connect", new InstagramStrategy({
    clientID: config.instagram.client_id,
    clientSecret: config.instagram.client_secret,
    callbackURL: config.instagram.connect_oauth_callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({"tokens.instagram.account_id": profile.id}, function(err, user){
      if (err) throw err;
      var account = {
        token: accessToken,
        account_id: profile.id,
        display_name: profile.displayName,
        raw_metadata: profile._json
      };
      if (user) { account.user_id = user.id; }
      return done(null, account);
    });
  }
));

// FLICKR Support

// authentication stuff
passport.use("flickr", new FlickrStrategy({
    consumerKey: config.flickr.api_key,
    consumerSecret: config.flickr.api_secret,
    callbackURL: config.flickr.oauth_callback_url
  },
  function(token, tokenSecret, profile, done){
    User.findOne({"tokens.flickr.account_id": profile.id}, function(err, user){
      console.log("flickr account data is " + util.inspect(profile));
      if (err) throw err;
      findOrCreateUserForOauthResponse("flickr", token, tokenSecret, user, profile, done);
    });
  }
));

// connect stuff 
passport.use("flickr-connect", new FlickrStrategy({
    consumerKey: config.flickr.api_key,
    consumerSecret: config.flickr.api_secret,
    callbackURL: config.flickr.connect_oauth_callback_url
  },
  function(token, tokenSecret, profile, done){
    User.findOne({"tokens.flickr.account_id": profile.id}, function(err, user){
      if (err) throw err;
      var account = {
        token: token,
        token_secret: tokenSecret,
        account_id: profile.id,
        display_name: profile.displayName,
        raw_metadata: profile._json
      };
      if (user) { account.user_id = user.id; }
      return done(null, account);
    });    
  }
));


// FACEBOOK Support
// authentication stuff
console.log("bloasdlksjda - " + config.facebook.app_id);
passport.use("facebook", new FacebookStrategy({
    clientID: config.facebook.app_id,
    clientSecret: config.facebook.app_secret,
    callbackURL: config.facebook.oauth_callback_url
  },
  function(accessToken, refreshToken, profile, done){
    User.findOne({"tokens.facebook.account_id": profile.id}, function(err, user){
      if (err) throw err;
      findOrCreateUserForOauthResponse("facebook", accessToken, null, user, profile, done);
    });
  }
));

// connect stuff 
passport.use("facebook-connect", new FacebookStrategy({
    clientID: config.facebook.app_id,
    clientSecret: config.facebook.app_secret,
    callbackURL: config.facebook.connect_oauth_callback_url
  },
  function(accessToken, refreshToken, profile, done){
    User.findOne({"tokens.facebook.account_id": profile.id}, function(err, user){
      if (err) throw err;
      var account = {
        token: accessToken,
        account_id: profile.id,
        display_name: profile.displayName,
        raw_metadata: profile._json
      };
      if (user) { account.user_id = user.id; }
      return done(null, account);
    });    
  }
));


// Token Auth for the API
passport.use("token-auth", new BearerStrategy({ }, 
  function(token, done){
    process.nextTick(function () {
      User.findOne({api_key: token}, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
      })
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.instagram_id);
});

passport.deserializeUser(function(uid, done) {
  User.findOne({instagram_id: uid}, function (err, user) {
    done(err, user);
  });
});
