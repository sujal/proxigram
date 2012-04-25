/**
 * Module dependencies.
 */

var express = require('express')
  , InstagramStrategy = require('passport-instagram').Strategy
  , mongoose = require('mongoose')
  , connect = require('connect')
  , HerokuRedisStore = require('connect-heroku-redis')(connect)
  , lessMiddleware = require('less-middleware');

var User = mongoose.model('User');

exports.boot = function(app) {
  bootApplication(app);
}

// PASSPORT Auth

// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.
passport.use(new InstagramStrategy({
    clientID: config.instagram.client_id,
    clientSecret: config.instagram.client_secret,
    callbackURL: config.instagram.oauth_callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      User.findOne({instagram_id: profile.id}, function(err, user){
        if (user) {
          done(null, user);
        } else {
          var new_user = new User();
          new_user.provider = "instagram";
          new_user.instagram_id = profile.id;
          new_user.instagram_name = profile.username;
          new_user.full_name = profile.full_name;
          new_user.profile_picture = profile.profile_picture;
          new_user.oauth_token = accessToken;
          new_user.save(function(err){
            if (err) { throw err; }
            done(null, new_user);
          });
        }
      });
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

// App settings and middleware

function bootApplication(app) {
  app.configure(function(){
  
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: 'layouts/default' })
    app.use(lessMiddleware({
            src: __dirname + '/public',
            compress: true
        }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ store: new HerokuRedisStore, secret: (process.env.SESSION_SECRET || "sssh sssh ssshhhhhhh") }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(__dirname + '/public'));
    app.use(express.logger(':method :url :status'));
    app.use(express.favicon());
    app.use(app.router);
  });
  
  app.configure('development', function(){
    // app.use(express.errorHandler());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });
  
}