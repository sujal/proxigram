
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , wizard = require('./wizard');
var lessMiddleware = require('less-middleware');

var app = module.exports = express.createServer();

// Configuration

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
app.get('/step2', wizard.step2);

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

