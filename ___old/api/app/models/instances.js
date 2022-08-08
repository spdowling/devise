'use strict';

var mongoose = require('mongoose'),
    util = require('util'),
    _ = require('underscore'),
    BaseSchema = require('./base');

function InstanceSchema() {
	BaseSchema.apply(this, arguments);

  this.add({
    pattern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pattern'
    },
    jobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }]
  });

  this.methods.hasAssociations = function(cb) {
    // associations relies on the concept of building associative structures
    // in the case of EPM we do this via the Node table. this means that when we
    // come to manage the structures, we need a way to handle all possible associations ...
    // how do we define that in some cases an item is that the top and in some cases it's then reused
    // in strange and interesting ways
    // in the case of how we would expect to add items we add associations to the parent
    // so in tha tway we are adding metadata on associations when we try to add a child
    // we dont work from the child to include it in the parent
    // so we should have an additional schema field on all instances which describes the
    // children it has? associations?
    // then we need to walk two ways to check if we are associated... so instead we need to have
    // another schema which is associations, we create an association between two items mking one a parent
    // and one a child
    // we should start off with having an individual document which is the parent we add children to
    // then when we go to add that to somethihng ....
    // easiest way to check if we are associated is to include both sides of all associations per instance
    // parents/children if we have parents, thats because we are associated to them, if we hve children
    // its because something is associated to us...
    // extracting this all means we need to be away of where we are added at all times...
    return cb(null, false);
  };

  this.methods.hasReferences = function(cb) {
    return cb(null, false);
  };

  // should this be a pre instead?
  this.statics.create = function(params, cb) {
    var Pattern = mongoose.model('Pattern');      

    Pattern.load(params.patternId, function(err, pattern) {
      if (err) return cb(err, null);

      var definitionSchema;
      try {
        definitionSchema = new mongoose.Schema(pattern.definition);
      } catch (err) { return cb(err, null); }

      if (definitionSchema) {
        var Model = this.discriminators[pattern.name] ?
                    this.discriminators[pattern.name] :
                    this.discriminator(pattern.name, definitionSchema);
        var instance = new Model(params);

        instance.save(function(err) {
          if (err) return cb(err, null);

          return cb(null, instance);
        });
      }
    });
  };

  // pre ?
  this.statics.update = function(id, params, cb) {
    this.load(id, function(err, instance) {
      if (err) return cb(err, null);

      // whether we are doing a patch or not, we apply the same logic, no?
      // or perhaps we should validate the whole item each time?
      instance = _.extend(instance, params);
      
      instance.save(function(err) {
        if (err) return cb(err, null);

        return cb(null, instance);
      });
    });
  };

  // pre?
  this.statics.destroy = function(id, cb) {
    this.load(id, function(err, instance) {
      if (err) return cb(err, null);

      if (!instance.hasAssociations()) {
        if (!instance.hasReferences()) {
          instance.remove(function(err) {
            if (err) return cb(err, null);

            return cb(null, instance);
          });
        } else {
          return cb({ message: 'Unable to delete instance '+id+' due to reference dependencies.' }, null);
        }
      } else {
        return cb({ message: 'Unable to delete instance '+id+' due to association dependencies.' }, null);
      }
    });
  };

  this.statics.findByPatternId = function(id, cb) {
    var Pattern = mongoose.model('Pattern');

    Pattern.load(id, function(err, pattern) {
      if (err) return cb(err, null);

      var discriminator = this.discriminators[pattern.name];
      discriminator.find(function(err, instances) {
        if (err) return cb(err, null);

        return cb(null, instances);
      });
    });
  };

  this.statics.findByWorkflowId = function(cb) {
    // find({ 'jobs.workflow.type': req.params.workflowId } ??
    return cb(null, true);
  };
}
util.inherits(InstanceSchema, BaseSchema);

var instanceSchema = new InstanceSchema();

mongoose.model('Instance', instanceSchema);

module.exports = InstanceSchema;
