'use strict';

var mongoose = require('mongoose');

/*
Interesting reading is looking at the Google APIs Explorer which uses a REST based JSON schema discovery service
to describe interactions with their APIs. One good thing is how they track the scope types.

'auth': {
  'oauth2': {
   'scopes': {
    'https://www.googleapis.com/auth/urlshortener': {
     'description': 'Manage your goo.gl short URLs'

So within OAuth2 Authorization flows, we can tell somebody that we are interested in accessing the urlshortener
scope and we get it back as the description to the user as well.

They then track against a specific resource (list, show etc.) the scopes that support this

So I could imagine that we are asking for a READ ONLY view of some data that is linked to the user. Well we can
say that we want READ ONLY access to just their own instances. So we could scope access to retrieving instance data
against one or more different endpoints that do that kind of thing.

this all assumes that we offer oauth, which should be fine, since then external clients can interact with this data,
which isn't a problem.

so how do we authenticate ourselves? can we pre-build an authorization for each user to our client? perhaps if we
identify a specific key, we know it's an internal client and so we can just allow it to do whatever it likes.

scopes are application specific information which could technically be hard-coded (but we don't like that do we :)
it would be good if somehow the scopes were part of the user management of ACLs and Roles but not sure how
complicated this is all getting now.



paypal includes scope in the original request as URLs, which seem to describe the endpoint access itself
rather than just describing some more general scope options


Custom client (local): can interact with the bearer token endpoint when local to the installation
Custom client (remote): can interact with the oauth authorization system. how can we restrict api endpoints depending on location?

*/
module.exports = function(passport) {
  passport.transformAuthInfo(function(info, done) {
    if (info.client) {
      var Client = mongoose.model('Client');
      
      Client.load(new mongoose.Types.ObjectId(info.client), null, function(err, client) {
        //console.log(client);
        if (err) return done(err);
        if (!client) return done({ message: 'unknown client' });
        
        info.client = client;
        done(null, info);
      });
    } else {
      done(null, info);
    }
  });

  var BasicStrategy = require('passport-http').BasicStrategy;
  passport.use(new BasicStrategy(
    function(username, password, done) {
      var Client = mongoose.model('Client');
      
      Client.findOne({ clientId: username }, function(err, client) {
        if (err) return done(err);
        if (!client) { return done(null, false); }
        if (!client.authenticate(password)) return done(null, false);
        
        return done(null, client);
      });
    }
  ));

  var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
  passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
      var Client = mongoose.model('Client');
      
      Client.findOne({ clientId: clientId }, function(err, client) {
        if (err) return done(err);
        if (!client) { return done(null, false); }
        if (!client.authenticate(clientSecret)) return done(null, false);
        
        return done(null, client);
      });
    }
  ));

  var BearerStrategy = require('passport-http-bearer').Strategy;
  passport.use(new BearerStrategy(
    function(accessToken, done) {
      var Token = mongoose.model('Token');
      
      Token.findOne({ token: accessToken, type: 'Access' }, function(err, token) {
        if (err) return done(err);
        if (!token) return done(null, false, { message: 'Invalid Token' });
        
        /*
        the code below will check for the validity of a token
        if we have hit the current configured max token life
        then we must refresh
        how do we tell somebody a token has expired?

        if (Math.round((Date.now()-token.createdAt/1000) > config.get('security:tokenLife'))) {
          Token.remove({ token: accessToken }, function(err) {
            if (err) return done(err);
          });
          return done(null, false, { message: 'Token Expired' });
        }
        */

        var User = mongoose.model('User');
        User.load(new mongoose.Types.ObjectId(token.userId), null, function(err, user) {
          if (err) return done(err);
          if (!user) return done(null, false, { message: 'Unknown User' });

          var info = { clientId: token.clientId, scope: '*' };
          return done(null, user, info);
        });
      });
    }
  ));
};