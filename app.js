/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var express = require('express')
var fs = require('fs')
    , utils = require('./lib/utils');

exports = module.exports = passport = require ('passport');

// AUTHENTICATION Middleware
// making these global for now - not sure what the best practice should be
ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.flash("warn", "You must be logged in to do that.");
  res.redirect('/step1');
}

ensureAdmin = function(req, res, next) {
  if (req.user !== undefined && req.user.admin == true) { return next(); }
  req.flash("warn", "You don't have permission to see that.");
  res.redirect("/");
}

// Plugin for models, also global :-(
simpleTimestamps = require('./lib/timestamps');

// Load configurations
exports = module.exports = config = require("./config");

require('./db-connect')                // Bootstrap db connection

// Bootstrap models
var models_path = __dirname + '/app/models'
var model_files = fs.readdirSync(models_path)
model_files.forEach(function(file){
  console.log("initialized: " + file);
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

// Start the app by listening on <port>
var port = process.env.PORT || 4000
app.listen(port)
console.log('Express app started on port '+port)
