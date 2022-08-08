'use strict';

var mongoose = require('mongoose'),
    util = require('util'),
    _ = require('underscore');

// We don't want to allow people to update or set the following values:
// _id, modifiedAt, modifiedBy, modifiedByClient, createdAt, createdBy, createdByClient

function BaseSchema() {
  mongoose.Schema.apply(this, arguments);

  this.add({
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: String
    },
    createdByClient: {
      type: String
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: String
    },
    modifiedByClient: {
      type: String
    },
  });

  // this should be part of a mongoose plugin
  this.statics.load = function(id, options, cb) {
    var schema = this.schema;
    var modelName = this.modelName;

    if (options) {
      if (options.populate) {
        _.each(options.populate, function (element, index) {
          var valid = (schema.pathType(element) === 'real' &&
                       schema.path(element).instance === 'ObjectID');
          
          if (!valid) delete options.populate[index];
        });
      }

      if (options.select) {
        _.each(options.select.split(' '), function (element) {
          var isSub = (element.split('.').length>1);
          
          if (!isSub) {
            var valid = (schema.pathType(element) === 'real');

            if (!valid) options.select = options.select.replace(' '+element, '');
          } else {
            if (options.populate) {
              var ref = element.split('.')[0];
              var path = element.split('.')[1];
              
              if (_.isArray(options.populate)) {
                _.each(options.populate, function (element) {
                  if (element.path === ref) {
                    options.populate.select = (options.populate.select) ? options.populate.select+' '+path : path;
                    options.select = options.select.replace(' '+ref+path, '');
                  }
                });
              } else {
                options.populate.select = (options.populate.select) ? options.populate.select+' '+path : path;
                options.select = options.select.replace(' '+element, '');
              }
            }
          }
        });
      }
    }

    var select = (options && options.select) ? options.select : null;

    if (options && options.populate) {
      this.findById(id, select).populate(options.populate).exec(function(err, item) {
        if (err) return cb(err, null);
        if (!item) return cb({ message: 'Failed to load '+modelName.toLowerCase()+' identified by '+id+'.'}, null);

        return cb(null, item);
      });
    } else {
      this.findById(id, select, function(err, item) {
        if (err) return cb(err, null);
        if (!item) return cb({ message: 'Failed to load '+modelName.toLowerCase()+' identified by '+id+'.'}, null);

        return cb(null, item);
      });
    }
  };

  // this should be part of a mongoose plugin
  this.statics.all = function(options, cb) {
    var schema = this.schema;
    var modelName = this.modelName;

    if (options) {
      if (options.sorting) {
        _.each(options.sorting.split(' '), function (element) {
          var properElement = (element.substr(0,1) === '-') ? element.substr(1) : element;
          var valid = (schema.pathType(properElement) === 'real');

          if (!valid) options.sorting = options.sorting.replace(' '+element, '');
        });
      }

      if (options.populate) {
        _.each(options.populate, function (element, index) {
          var valid = (schema.pathType(element) === 'real' &&
                       schema.path(element).instance === 'ObjectID');
          
          if (!valid) delete options.populate[index];
        });
      }

      if (options.select) {
        _.each(options.select.split(' '), function (element) {
          var isSub = (element.split('.').length>1);
          
          if (!isSub) {
            var valid = (schema.pathType(element) === 'real');

            if (!valid) options.select = options.select.replace(' '+element, '');
          } else {
            if (options.populate) {
              var ref = element.split('.')[0];
              var path = element.split('.')[1];
              
              if (_.isArray(options.populate)) {
                _.each(options.populate, function (element) {
                  if (element.path === ref) {
                    options.populate.select = (options.populate.select) ? options.populate.select+' '+path : path;
                    options.select = options.select.replace(' '+ref+path, '');
                  }
                });
              } else {
                options.populate.select = (options.populate.select) ? options.populate.select+' '+path : path;
                options.select = options.select.replace(' '+element, '');
              }
            }
          }
        });
      }

      var query = (options.query) ? options.query : {};
    
      var select = (options.select) ? options.select : null;

      var opts = (options.skip || options.limit || options.sorting) ? {} : null;

      if (options.skip) opts.skip = options.skip;
      if (options.limit) opts.limit = options.limit;
      if (options.sorting) opts.sort = options.sorting;

      if (options.populate) {
        this.find(query, select, opts).populate(options.populate).exec(function(err, items) {
          if (err) return cb(err, null);
          if (!items) return cb({ message: 'Failed to load array of '+modelName+'.'}, null);

          return cb(null, items);
        });
      } else {
        this.find(query, select, opts, function(err, items) {
          if (err) return cb(err, null);
          if (!items) return cb({ message: 'Failed to load array of '+modelName+'.'}, null);

          return cb(null, items);
        });
      }
    } else {
      this.find(function(err, items) {
        if (err) return cb(err, null);
        if (!items) return cb({ message: 'Failed to load array of '+modelName+'.'}, null);

        return cb(null, items);
      });
    }
  };

  // we also want to populate the by and byClient fields according to
  // the current authentication details we have stored in the current session
  // for this particular request.
  this.pre('save', function (next, auth, cb) {
    if (this.isNew) {
      this.modifiedBy = this.createdBy = auth.user.username;
      this.modifiedByClient = this.createdByClient = auth.client.name;
      this.modifiedAt = this.createdAt;
    } else {
      this.modifiedBy = auth.user.username;
      this.modifiedByClient = auth.client.name;
      this.modifiedAt = new Date;
    }

    next(cb);
  });
}
util.inherits(BaseSchema, mongoose.Schema);

module.exports = BaseSchema;

// http://localhost:3000/instances?embed=pattern&fields=name,pattern,pattern.name
// works as intended. Will populate pattern if available or return null
// will also restrict available fields to both name at top level, include pattern
// and then also include the pattern name.