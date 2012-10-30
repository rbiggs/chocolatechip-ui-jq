// Import cryptography for user authentication:
var crypto = require('crypto');

// Used to generate a hash of the plain-text password + salt.
function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

// Manage user login:
exports.index = function(req, res) {
  // If the user is already logged in,
  // send him to the products page.
  if (req.session.user) {
    res.redirect('/');
  // Otherwise send him to the login page.
  } else {
    res.render('login');
  }
};
var users = {
  'craig': {
    'name': 'craig',
    'salt': 'randomly-generated-salt',
    'pass': hash('abc', 'randomly-generated-salt')
  },
  'robert': {
    'name': 'robert',
    'salt': 'randomly-generated-salt',
    'pass': hash('abc', 'randomly-generated-salt')
  },
  'somnath': {
    'name': 'somnath',
    'salt': 'randomly-generated-salt',
    'pass': hash('abc', 'randomly-generated-salt')
  }
};
//Generate salt for the user to prevent rainbow table attacks.
//var authorized = require('users_model');

// Authenticate using our plain object.
// For a real app you'd use some kind of data persistance (database).
function authenticate(name, pass, fn) {
  var user = users[name];
  // If the user doesn't exist, handle it:
  if (!user) return fn(new Error('cannot find user'));
  /* 
     Apply the same algorithm to the POSTed password, applying
     the hash against the pass / salt, if there is a match we
     found the user. 
  */
  if (user.pass == hash(pass, user.salt)) return fn(null, user);
  // Otherwise password is invalid:
  fn(new Error('invalid password'));
}

// Handle the posting of the username and password.
exports.login = function (req, res) {
  // Retrive the username and password from the request body.
  authenticate(req.body.username, req.body.password, function(err, user) {
    // If the username entered is legit, validate session.
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function() {
        /*
          Store the user's primary key 
          in the session store to be retrieved,
          or in this case the entire user object,
        */
        req.session.user = user;
        res.redirect('back');
      });
    // Otherwise, user entered wrong username, so redirect back to login with a message.
    } else {
      req.session.error = 'Authentication failed. Please check your username and password.';
      res.redirect('back');
    }
  });
};

// Logout the user:
exports.logout = function(req, res) {
  // Destroy the user's session to log them out.
  // Will be re-created next request.
  req.session.destroy(function() {
    res.redirect('/login');
  });
};


// Function to restrict access to certain routes.
// This will be passed in as an argument for the routes to be restricted.
exports.restrict = function(req, res, next) {
  // If the user is logged in, continue:
  if (req.session.user) {
    next();
  // Else redirect the user to login and inform them with a message:
  } else {
    req.session.error = 'Access denied! Please login.';
    res.redirect('/login');
  }
}
