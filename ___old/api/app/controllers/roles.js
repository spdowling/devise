'use strict';

var mongoose = require('mongoose'),
authorization = require('../../config/authorization'),
_ = require('underscore');

module.exports = {
  options: {
    name: 'roles',
    id: 'roleId'
  },
  all: [authorization],
  // GET    /roles - index
  // GET    /users/:userId/roles - index according to user
  index: function(req, res) {
    var Role = mongoose.model('Role');
    if (!req.params.userId) {
      Role.all(res.locals.mongoose, function(err, roles) {
        if (err) return res.json(500, err);
        if (!roles) return res.json(500, new Error('Failed to load roles.'));

        return res.json(roles);
      });
    } else {
      // find all roles of a specific user and then return the relevant role information
      // sounds like we then need to query the user and return roles via populate?
      Role.find(function(err, roles) {
        if (err) return res.json(500, err);
        if (!roles) return res.json(500, new Error('Failed to load roles.'));

        return res.json(roles);
      });
    }
  },
  // GET    /roles/:roleId - show
  show: function(req, res) {
    if (!req.params.userId) {
      var Role = mongoose.model('Role');
      
      Role.load(req.params.roleId, res.locals.mongoose, function(err, role) {
        if (err) return res.json(500, err);
        if (!role) return res.json(500, new Error('Failed to load Role '+req.params.roleId+'.'));
        
        return res.json(role);
      });
    } else {
      return res.json(405);
    }
  },
  // POST   /roles - create
  create: function(req, res) {
    var Role = mongoose.model('Role');
    var model = new Role(req.body);

    if (!req.params.userId) {
      model.save(function(err) {
        if (err) return res.json(500, err);
        
        return res.json(model);
      });
    } else {
      return res.json(405);
    }
  },
  // PUT    /roles/:roleId - update
  update: function(req, res) {
    if (!req.params.userId) {
      var Role = mongoose.model('Role');

      Role.load(req.params.roleId, res.locals.mongoose, function(err, role) {
        if (err) return res.json(500, err);
        if (!role) return res.json(500, new Error('Failed to load role '+req.params.roleId+'.'));

        role = _.extend(role, req.body);
        
        role.save(res.locals.auth, function(err) {
          if (err) return res.json(500, err);

          return res.json(role);
        });
      });
    } else {
      return res.json(405);
    }
  },
  // DELETE /roles/:roleId - destroy
  destroy: function(req, res) {
    if (!req.params.userId) {
      var Role = mongoose.model('Role');

      Role.load(req.params.roleId, function(err, role) {
        if (err) return res.json(500, err);
        if (!role) return res.json(500, new Error('Failed to load role '+req.params.roleId+'.'));

        role.remove(function(err) {
          if (err) return res.json(500, err);

          return res.json(role);
        });
      });
    } else {
      return res.json(405);
    }
  }
};
