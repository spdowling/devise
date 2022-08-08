'use strict';

var passport = require('passport'),
    mongoose = require('mongoose'),
    _ = require('underscore');

module.exports = function(req, res, next) {
  passport.authenticate('bearer', { session: false }, function(err, user, info) {
    if (err) return res.json(500, { error: err });
    if (!user) {
      // this should be 401 or 500 ? if we have no info, it must have been bad
      if (!info) return res.json(401, { code: 1001, message: 'Unknown authentication error', description: '' });
      
      return res.json(401, { code: 1234, message: info, description: 'Invalid authentication request.' });
    }

    var passportUser = user;

    if (!info.clientId) {
      // throw an error, we must have a client
    } else {
      var Client = mongoose.model('Client');

      Client.load(new mongoose.Types.ObjectId(info.clientId), null, function(err, client) {
        if (err) return next(err);
        if (!client) return next({ message: 'unknown client' });

        info.client = client;
      });

      var permissions = [];
      switch (req.method.toLowerCase()) {
        case 'get':
          permissions.push('read');
          permissions.push('write');
          break;
        case 'put':
          permissions.push('write');
          permissions.push('update');
          break;
        case 'post':
          permissions.push('write');
          permissions.push('update');
          break;
        case 'patch':
          permissions.push('write');
          permissions.push('update');
          break;
        case 'delete':
          permissions.push('write');
          permissions.push('delete');
          break;
      }

      // takes the existing path and extracts the last known resource from it
      var resource = _.last(_.without(_.map(req.path.split('/'), function(part) {
        return (part.match(/[0-9a-fA-F]{24}/)) ? ':param' : part;
      }), ':param'));
      
      // find if any of the permissions required are met by any of the roles that we have assigned to the current user
      if (permissions.length > 0 && resource) {
        passportUser.populate('roles', function(err, user) {
          if (user.roles.length > 0) {
            user.roles.forEach(function(role) {
              var allowed = _.some(role.permissions, function(perm) {
                return _.some(permissions, function(item) {
                  if (perm.resource === resource && perm.permission === item) return true;
                });
              });
              if (allowed) {
                req.logIn(passportUser, { session: false }, function(err) {
                  if (err) return next(err);

                  res.locals.auth = req.authInfo = { client: info.client, user: passportUser };
                  
                  return next();
                });
              } else { res.json(403, { error: 'Forbidden' }); }
            });
          } else {
            return res.json(403, { error: 'No roles assigned to user' });
          }
        });
      } else {
        res.json(405, { error: 'incorrect permissions requested' });
      }
    }
  })(req, res, next);
};