'use strict';

var mongoose = require('mongoose'),
    _ = require('underscore');

module.exports = {
  options: {
    name: 'users',
    id: 'userId'
  },
  all: function(req, res, next) {
    next();
  },
  // GET    /users - Show me all users
  // GET    /roles/:roleId/users - Show me all users associatd to the role identified by :roleId
  // if we don't have administrator access, perhaps we should only get to see ourselves here?
  index: function(req, res) {
    var User = mongoose.model('User');
    if (!req.params.roleId) {
      User.all(function(err, users) {
        if (err) return res.json(500, err);
        if (!users) return res.json(500, new Error('Failed to load users.'));

        return res.json(users);
      });
    } else {
      User.find(function(err, users) {
        if (err) return res.json(500, err);
        if (!users) return res.json(500, new Error('Failed to load users.'));

        return res.json(users);
      });
    }
  },
  // GET    /users/:userId - Show me the user identified by :userId
  show: function(req, res) {
    if (!req.params.roleId) {
      var User = mongoose.model('User');
      
      User.load(req.params.userId, function(err, user) {
        if (err) return res.json(500, err);
        if (!user) return res.json(500, new Error('Failed to load User '+req.params.userId+'.'));
        
        return res.json(user);
      });
    } else {
      return res.json(405);
    }
  },
  // POST   /users - Create a user from req.body
  // POST   /roles/:roleId/users - Create a user from req.body, with the role identified by :roleId?

  // we can update a user to create a specific role...
  create: function(req, res) {
    var User = mongoose.model('User');
    var model = new User(req.body);

    if (!req.params.roleId) {
      model.save(function(err) {
        if (err) return res.json(500, err);
        
        return res.json(model);
      });
    } else {
      model.save(function(err) {
        if (err) return res.json(500, err);

        return res.json(model);
      });
    }
  },
  // PUT    /users/:userId - Update user identified by :userId from req.body
  update: function(req, res) {
    if (!req.params.roleId) {
      var User = mongoose.model('User');

      User.load(req.params.userId, function(err, user) {
        if (err) return res.json(500, err);
        if (!user) return res.json(500, new Error('Failed to load user '+req.params.userId+'.'));

        if (req.body.roles && _.isArray(req.body.roles) && req.body.roles.length > 0) {
          var Role = mongoose.model('Role');
          req.body.roles.forEach(function(roleId) {
            Role.load(roleId, function(err, role) {
              console.log(roleId);
              console.log(role);
              if (err) res.json(500, err);
              if (!role) return res.json(500, new Error('Failed to load related role '+roleId+'.'));
              
              user.roles.push(role._id);

              //user = _.extend(user, req.body);
        
              user.save(function(err) {
                if (err) return res.json(500, err);

                return res.json(user);
              });
            });
          });
        }
      });
    } else {
      return res.json(405);
    }
  },
  // DELETE /users/:userId - Delete user identified by :userId
  destroy: function(req, res) {
    if (!req.params.roleId) {
      var User = mongoose.model('User');

      User.load(req.params.userId, function(err, user) {
        if (err) return res.json(500, err);
        if (!user) return res.json(500, new Error('Failed to load user '+req.params.userId+'.'));

        user.remove(function(err) {
          if (err) return res.json(500, err);

          return res.json(user);
        });
      });
    } else {
      return res.json(405);
    }
  }
};
