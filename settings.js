/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , connect = require('connect')
  , HerokuRedisStore = require('connect-heroku-redis')(connect)
  , lessMiddleware = require('less-middleware')
  , PuSHHelper = require('node-push-helper').PuSHHelper;

var User = mongoose.model('User');

Instagram = require('instagram-node-lib');
Instagram.set('client_id', config.instagram.client_id);
Instagram.set('client_secret', config.instagram.client_secret);
Instagram.set('callback_url', config.instagram.realtime_callback_url);
Instagram.set('maxSockets', 10);

exports.boot = function(app) {
  bootApplication(app);
}

require("./lib/passport-config.js");

// App settings and middleware

function bootApplication(app) {
  app.configure(function(){
  
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: 'layouts/default' });
    app.set('jsonp callback', true);
    app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: 2592000000 }));
    // app.use(lessMiddleware({
    //         src: __dirname + '/public',
    //         compress: true
    //     }));
    app.use(require('connect-assets')());
    
    // HACKY middleware to bring req.rawBody back since
    // Instagram-node-lib requires it. Will fix that lib
    // soon.
    // This taken from here: https://github.com/visionmedia/express/issues/897
    // app.use (function(req, res, next) {
    //     req.rawBody = '';
    //     req.setEncoding('utf8');
    //     req.on('data', function(chunk) { req.rawBody += chunk });
    //     next();
    // });
    app.use(PuSHHelper.signature_calculator(config.instagram.client_secret, "/instagram"));
    app.use(PuSHHelper.signature_calculator(config.flickr.api_secret, "/flickr"));
    app.use(PuSHHelper.signature_calculator(config.facebook.app_secret, "/facebook"));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ store: new HerokuRedisStore, secret: (process.env.SESSION_SECRET || "sssh sssh ssshhhhhhh") }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(__dirname + '/public', {maxAge: 86400000}));
    app.use(express.logger(':method :url :status'));
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