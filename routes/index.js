var express = require('express');
var router = express.Router();

router.get('/', function(request, response) {
  /*
  The presence of a username cookie indicates that a user is logged in. If they aren't, they have
  to go look at the login screen first.
  */
  if (request.cookies.username) {
    response.render('index.jade', {});
  } else {
    response.redirect('/login');
  }
});

module.exports = router;
