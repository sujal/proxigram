/**
 * Module dependencies.
 */

var express = require('express')
  , InstagramStrategy = require('passport-instagram').Strategy
  , BearerStrategy = require('passport-http-bearer').Strategy
  , mongoose = require('mongoose')
  , connect = require('connect')
  , HerokuRedisStore = require('connect-heroku-redis')(connect)
  , lessMiddleware = require('less-middleware');

var User = mongoose.model('User');

Instagram = require('instagram-node-lib');
Instagram.set('client_id', config.instagram.client_id);
Instagram.set('client_secret', config.instagram.client_secret);
Instagram.set('callback_url', config.instagram.realtime_callback_url);
Instagram.set('maxSockets', 10);

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
          new_user.displayName = profile.displayName;
          new_user.name = profile.name;
          new_user.bio = profile._json.data.bio;
          new_user.website = profile._json.data.website;
          new_user.external_counts.instagram = profile._json.data.counts;
          new_user.profile_picture = profile._json.data.profile_picture;
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

// App settings and middleware

function bootApplication(app) {
  app.configure(function(){
  
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: 'layouts/default' });
    app.set('jsonp callback', true);
    app.use(lessMiddleware({
            src: __dirname + '/public',
            compress: true
        }));
        
    // HACKY middleware to bring req.rawBody back since
    // Instagram-node-lib requires it. Will fix that lib
    // soon.
    // This taken from here: https://github.com/visionmedia/express/issues/897
    app.use (function(req, res, next) {
        req.rawBody = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk) { req.rawBody += chunk });
        next();
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ store: new HerokuRedisStore, secret: (process.env.SESSION_SECRET || "sssh sssh ssshhhhhhh") }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(__dirname + '/public', {maxAge: 86400000}));
    app.use(express.logger(':method :url :status'));
    app.use(express.favicon());
    app.use(app.router);
  });
  
  app.configure('development', function(){
    // app.use(express.errorHandler());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });
  
  // Suppress errors, allow all search engines
  app.configure('production', function(){
  	app.all('/robots.txt', function(req,res) {
  		res.send('User-agent: *', {'Content-Type': 'text/plain'});
  	});
  });
  
  // Template helpers
  app.dynamicHelpers({
  	'session': function(req, res) {
  		return req.session;
  	},
  	'current_user': function(req, res) {
  	  return req.user === undefined ? null : req.user;
  	},
  	messages: require('express-messages-bootstrap')
  });
  
}