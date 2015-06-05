/* jshint node:true */
'use strict';
var express = require('express');
var router = express.Router();
var app = require('../app');

// request handler for the main page.
router.get('/', function(request, response) {
  /*
  The presence of a username cookie indicates that a user is logged in. If they aren't, they have
  to go look at the login screen first.
  */
  if (! request.cookies.username) {
    response.redirect('/login');
    return;
  }

  var database = app.get('database');
  database('messages')
  .join('users', 'users.id', '=', 'messages.user_id')
  .select('messages.body', 'messages.posted_at', 'users.username')
  .orderBy('messages.posted_at', 'desc').then(function(messages) {
    messages.forEach(function(message) {
      var posted = message.posted_at;
      message.formattedDate = (posted.getMonth() + 1) + '/' + posted.getDate() + '/' + posted.getFullYear() + ' ' + posted.getHours() + ':' + posted.getMinutes();
    });
    response.render('index.jade', {messages: messages})
  });
});

/*
request handler for receiving new messages.
*/
router.post('/message', function(request, response) {
  // You must be logged in to post a message.
  // You can't see the form anyway, but this prevents forged requests from creating messages by unknown users.
  if (! request.cookies.username) {
    response.redirect('/login');
    return;
  }

  var database = app.get('database');
  database('users').where({username: request.cookies.username}).then(function (records) {
    // technically we should check to see that we really got a user here, but I'm just gonna trust that the presence
    // of a username cookie indicates a user exists by that name.
    var user = records[0];

    database('messages').insert({
      user_id: user.id,
      body: request.body.message,
    }).then(function() {
      response.redirect('/');
    });
  });
});

module.exports = router;
