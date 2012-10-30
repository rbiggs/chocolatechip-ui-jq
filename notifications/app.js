/*
  Module dependencies.
*/
var express = require('express');

/*
 Server setup
*/
// Create an instance of the server:
var app = express.createServer();
// Import configuration settings for server:
var configuration = require('./controllers/configuration');
var io = require('socket.io').listen(app);
// Initialize server configuration:
configuration.setup(app);


/*
 Import route helpers:
*/
var index = require('./controllers/index');
var authenticate = require('./controllers/authenticate');

/*
 Handle route verbs:
*/
// Handle access to the main page
app.get('/', index.load);
// Handle access to the login page.
app.get('/login', authenticate.index);
// Login user:
app.post('/login', authenticate.login);
// This is executed when the user clicks a logout link:
app.get('/logout', authenticate.logout);
app.get('/producer', authenticate.restrict, function (req, res) {
    res.render('./producer');
});
app.get('/consumer', function (req, res) {
    res.render('./consumer');
});

/*
 Basic Error Handling
*/
// If the route provided was not trapped by the previous handlers,
// render it as a 404 error page.

app.use(function(req, res, next) {
  // respond with html page
  res.render('404');
  return;
});

// Tell the server what port to listen to.
app.listen(8080);
console.log('Express server listening on port %d in %s mode', app.address().port, app.settings.env);
