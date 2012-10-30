// Import Express for use by configuration methods:
var express = require('express');

// Export server configuration:
exports.setup = function(app) {
	var path = __dirname.substr(0, __dirname.lastIndexOf('/'));
	// Server configuration
	app.configure(function() {
	  // Path for the app's views:
	  app.set('views', path + '/views');
	  // Which template engine the app will use:
	  app.set('view engine', 'jade');
	  app.use(express.bodyParser());
	  // This will parse the body of node request
	  app.use(express.cookieParser());
	  // Set up session support (setting a 'secret' is required)
	  app.use(express.session({ secret: 'robot cowboy' }));
	  // This allows you to overload any methods and still access the original
	  app.use(express.methodOverride());
	  // Use the CSS preprocess Stylus:
	  app.use(require('stylus').middleware({ src: path + '/public' }));
	  // Use the router.js file
	  app.use(app.router);
	  // Designate a directory for static files that won't change:
	  app.use(express.static(path + '/public'));
	});
	
	// Define a configuration state for development mode.
	// This dumps the full stack to the terminal console.
	// Set this in the terminal: NODE_ENV=production
	app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});
	
	// Define a configuration state for production mode.
	// This prevents output of error info to the terminal.
	// Set this in the terminal: NODE_ENV=production
	app.configure('production', function(){
	  app.use(express.errorHandler()); 
	});
	
	//These are some helpers for session management.
	app.dynamicHelpers({
	  message: function(req){
		var err = req.session.error
		  , msg = req.session.success;
		delete req.session.error;
		delete req.session.success;
		if (err) {
		  var error = "<span class='error'>";
		  return error + err + '</span>';
		}
		if (msg) return msg;
	  }
	});
};