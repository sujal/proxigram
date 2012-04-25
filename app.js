/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var express = require('express')
var fs = require('fs')
    , utils = require('./lib/utils')
    , simpleTimestamps = require('./lib/timestamps')
    , auth = require('./authorization');


// Load configurations
exports = module.exports = config = require("./config");

require('./db-connect')                // Bootstrap db connection

// Bootstrap models
var models_path = __dirname + '/app/models'
var model_files = fs.readdirSync(models_path)
model_files.forEach(function(file){
  if (file == 'user.js')
    User = require(models_path+'/'+file)
  else
    require(models_path+'/'+file)
})

var app = express.createServer()       // express app
require('./settings').boot(app)        // Bootstrap application settings

// Bootstrap controllers
var controllers_path = __dirname + '/app/controllers'
var controller_files = fs.readdirSync(controllers_path)
controller_files.forEach(function(file){
  require(controllers_path+'/'+file)(app)
})

require('./error-handler').boot(app)   // Bootstrap custom error handler
mongooseAuth.helpExpress(app)          // Add in Dynamic View Helpers
everyauth.helpExpress(app, { userAlias: 'current_user' })

// Start the app by listening on <port>
var port = process.env.PORT || 4000
app.listen(port)
console.log('Express app started on port '+port)




/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require ('passport')
  , InstagramStrategy = require('passport-instagram').Strategy
  , controllers = require("./controllers")
  , mongoose = require('mongoose');
var connect = require('connect'), 
    HerokuRedisStore = require('connect-heroku-redis')(connect);
var lessMiddleware = require('less-middleware');

var User = require("./models/user").User;

// mongoose.connect(process.env.MONGOHQ_URL || "mongodb://localhost/proxigram_development");
// 
// // Configuration
// 
// var INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID
// var INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
// 
// var oauth_callback_url = null;
// if (process.env.NODE_ENV == undefined || process.env.NODE_ENV == "development") {
//   oauth_callback_url = "http://proxigram.dev/auth/instagram/callback"
// } else {
//   // some other environment
//   oauth_callback_url = "http://proxigram.com/auth/instagram/callback"  
// }

// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.
passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_CLIENT_ID,
    clientSecret: INSTAGRAM_CLIENT_SECRET,
    callbackURL: oauth_callback_url
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

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
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
  app.use(app.router);
});

app.configure('development', function(){
  // app.use(express.errorHandler());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// 
// app.configure('production', function(){
//   app.use(express.errorHandler());
// });

function NotFound(msg) {
	this.name = 'NotFound';
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;


// Routes

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/step1', wizard.step1);
app.get('/step2', ensureAuthenticated, wizard.step2);
app.get('/code', ensureAuthenticated, wizard.code);
app.get('/api/photos', api.photos);
app.get('/auth/instagram',
  passport.authenticate('instagram'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });
app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/step1' }),
  function(req, res) {
    res.redirect('/step2');
  });
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('*', function(req, res) {
	throw new NotFound('Page not found.');
});

var port = process.env.PORT || 3000
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// Custom 404 stuff
app.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { title: "That link was broken!" });
    } else {
        res.render('error.jade', { title: "Whoa! Error!", error: err });
    }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/step1');
}