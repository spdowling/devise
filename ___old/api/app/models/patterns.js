'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./base');

function PatternSchema() {
  return new BaseSchema({
    name: {
      type: String,
      required: true
    },
    definition: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pattern'
    },
    ancestors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pattern'
    }]
  });
}
var patternSchema = new PatternSchema();

patternSchema.methods.hasInstances = function(cb) {
  // edit to update with correct use of Instances.
  var collection = mongoose.connection.collections.instances.collection;
  
  collection.find({ __t: this.name }, function(err, instances) {
    if (err) return cb(err, false);
    
    if (!instances || instances.length === 0) {
      return cb(null, false);
    } else {
      return cb(null, true);
    }
  });
};

// perhaps we can ignore this and allow people to just embed ancestors?
// we need to handle the use of subpath field selection as well ... right now using json mask that's possible, but it seems that
// currently in our own logic it's not possible. what we would ideally be able to do is force an embed when somebody asks for a child path
// or even if we populate we can then provide a child path and just state that it's part of the logic, you can't include
// or select a child element if you don't embed or populate it inside of the original response
patternSchema.statics.loadWithAncestors = function(id, cb) {
  this.findById(id).populate('ancestors', 'name definition').exec(cb);
};

mongoose.model('Pattern', patternSchema);

module.exports = PatternSchema;

// one thing that is definitely valid regarding Patterns is what we can take from EPM regarding tiers
// we don't want customers to edit certain patterns, since they identify import individual expectations
// for UI handling
// So for that reason we can assume that we have some internal patterns (which must be identified)
// versus patterns which are customer managed
// in terms of any other tier levels, I don't see a need right now to handle that

// We may have two levels of internal pattern ourselves however
// Core Patterns - this are common across all markets and all customers, these are things like spec chars and facts
// Market Patterns - these are patterns related to a specific customer type, such as SID related items for Telcos...
//        They should not affect the use of UI controls, widgets or any processing. Instead it should reuse those existing
//        items