'use strict';

var oauth2orize = require('oauth2orize'),
    mongoose = require('mongoose'),
    passport = require('passport');

function createToken() {
  var buf = [],
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      charlen = chars.length;
  var len = 256;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[Math.floor(Math.random()*((charlen-1) - 0 + 1))+0]);
  }

  return buf.join('');
}

var server = oauth2orize.createServer();

server.exchange(oauth2orize.exchange.password(function(clientIn, username, password, scope, done) {
  var Client = mongoose.model('Client');

  Client.findOne({ clientId: clientIn.clientId }, function(err, client) {
    if (err) return done(err);
    if (!client) return done(null, false);

    if (client.clientSecret !== clientIn.clientSecret) return done(null, false);

    var User = mongoose.model('User');

    User.findOne({ username: username }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);
      if (!user.authenticate(password)) return done(null, false);

      var Token = mongoose.model('Token');
      Token.remove({ userId: user.id, clientId: client.id }, function(err) {
        if (err) return done(err);
      });

      var refreshTokenValue = createToken();
      var refreshToken = new Token({ token: refreshTokenValue, clientId: client.id, userId: user.id, type: 'Refresh' });
      refreshToken.save(function(err) {
        if (err) return done(err);
      });

      var accessTokenValue = createToken();
      var accessToken = new Token({ token: accessTokenValue, clientId: client.id, userId: user.id, type: 'Access' });
      accessToken.save(function(err) {
        if (err) return done(err);
        // config.get('security:tokenLife') - , { 'expires_in': 3600 }
        done(null, accessTokenValue, refreshTokenValue, { 'user': user.id });
      });
    });
  });
}));

server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
  var Token = mongoose.model('Token');

  Token.findOne({ token: refreshToken, type: 'Refresh' }, function(err, token) {
    if (err) return done(err);
    if (!token) return done(null, false);

    var User = mongoose.model('User');

    User.load(token.userId, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);

      //remove any previous refresh
      Token.remove({ userId: user.userId, clientId: client.id }, function(err) {
        if (err) return done(err);
      });

      //remove any previous access
      Token.remove({ userId: user.userId, clientId: client.id, type: 'Access' }, function(err) {
        if (err) return done(err);
      });

      var refreshTokenValue = createToken();
      var refreshToken = new Token({ token: refreshTokenValue, clientId: client.id, userId: user.userId, type: 'Refresh' });
      refreshToken.save(function(err) {
        if (err) return done(err);
      });

      var accessTokenValue = createToken();
      var accessToken = new Token({ token: accessTokenValue, clientId: client.id, userId: user.userId, type: 'Access' });
      accessToken.save(function(err) {
        if (err) return done(err);
        // , { 'expires_in': config.get('security:tokenLife') }
        done(null, accessTokenValue, refreshTokenValue);
      });
    });
  });
}));

exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler()
];