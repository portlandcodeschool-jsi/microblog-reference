/* jshint node:true */
'use strict';
var express = require('express');
var router = express.Router();
var app = require('../app');

/*
Request handler for showing the login page.
*/
router.get('/login', function(request, response) {
  response.render('login.jade');
});

/*
Request handler for receiving login requests. The username and password must match an existing user.
*/
router.post('/login', function(request, response) {
  var user,
      database = app.get('database');

  // Try to find a user with the given username...
  database('users').where({username: request.body['login-username']})
  .then(function(records) {
    // records is all the rows returned by our SQL query.
    if (records.length === 0) {
      response.render('login.jade', {error: "There is no user by that name!"});
    } else if (records.length === 1) {
      // We found exactly one user!
      user = records[0];
      if (user.password === request.body['login-password']) {
        // Set a cookie indicating that the user is logged in, and send them to the homepage.
        response.cookie('username', user.username);
        response.redirect('/');
      } else {
        /*
        The passwords didn't match, so re-render the login page.
        We'll include an error message telling the user what's going on,
        and pre-fill the username field with the username they entered (so they don't have to type it again).
        */
        response.render('login.jade', {
          error: "That is not the right password. Try a different one.",
          loginUsername: user.username
        });
      }
    } else {
      /*
      This case shouldn't ever happen, but it's better to fail with a clear message than to try and forge ahead
      when we find an incomprehensible case. If the else-if block above were just an else, and there were actually
      multiple users with one name, one of them would be able to log in while the rest would get "incorrect password"
      errors no matter how carefully they typed.
      */
      throw new Error('The sky is falling: multiple users named "' + request.body['login-username'] + '"!');
    }
  });
});

/*
Request handler for receiving registration requests.
*/
router.post('/register', function(request, response) {
  var database = app.get('database');

  /*
  Check that the user typed the same password twice, since they have to type it without seeing it.
  This is first so that if the passwords don't match, we don't have to put any load on the database.
  */
  if (request.body['register-password'] !== request.body['confirm-password']) {
    response.render('login.jade', {
      error: 'Password did not match confirmation! Try typing better.',
      registerUsername: request.body['register-username']
    });
    return;
  }

  /*
  Check for a user who already has the desired name. Since the database schema has a unique constraint on the username,
  it'll throw an error if we try to double-create.
  */
  database('users').where({username: request.body['register-username']})
  .then(function(records) {
    if (records.length === 0) {
      // There's no user wit the desired username, so we can go ahead and create one.
      database('users').insert({
        username: request.body['register-username'],
        password: request.body['register-password']
      }).then(function() {
        // set the cookie that indicates the user is logged in and send them off to the home page.
        response.cookie('username', request.body['request-username']);
        response.redirect('/');
      });
    } else {
      /*
      re-render the registration page with a useful error. We won't include the username they typed;
      since they can't use it anyway, they'd just have to clear it out.
      */

      response.render('login.jade', {error: 'That username is taken. Try a different one!'});
    }
  });
});

/*
Request handler for logging out. All we have to do is clear the cookie and send the user somewhere else.
*/
router.get('/logout', function(request, response) {
  response.clearCookie('username');
  response.redirect('/login');
});

module.exports = router;
