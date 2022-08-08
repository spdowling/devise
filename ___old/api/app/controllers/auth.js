'use strict';

var oauth = require('../../config/oauth'),
    passport = require('passport');

// I think the original idea here was to return information on the current authorization that we are using
// but perhaps instead we should just include a shortcut in the user resource to return the information
// relevant to the current user right now?
module.exports = {
  options: {
    name: 'auth',
    before: {
      index: [passport.authenticate('bearer', { session: false })],
      create: [oauth.token]
    }
  },
  index: function(req, res) {
    console.log(req.user);
    // get user information from passport
    // how do we do that since we aren't using a session?
    // can we extract information to find details?
    console.log(req.header('Authentication'));
    // at this point, we should have a user defined

    res.send('made it to show!');
  },
  create: function() { },
  destroy: function(req, res) {
    res.send('haha');
  }
};