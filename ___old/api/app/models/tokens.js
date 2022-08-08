'use strict';

var mongoose = require('mongoose'),
    util = require('util');

function TokenSchema() {
  mongoose.Schema.apply(this, arguments);

  this.add({
    userId: {
      type: String,
      required: true
    },
    clientId: {
      type: String,
      required: true
    },
    token: {
      type: String,
      unique: true,
      required: true
    },
    type: {
      type: String,
      enum: [ 'Access', 'Refresh' ],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  });

  this.pre('save', function (next, authInfo, cb) {
    // we need the username as well as the client name from the authorization
    // we have access to the user when doing req.login apparently ...
    // but not sure what it does really in the background
    if (this.isNew) {
      this.modifiedBy = this.createdBy = 
      this.modifiedByClient = this.createdByClient = 
      this.modifiedAt = this.createdAt;
    } else {
      this.modifiedBy = 
      this.modifiedByClient = 
      this.modifiedAt = new Date;
    }

    next();
  });
}
util.inherits(TokenSchema, mongoose.Schema);

var tokenSchema = new TokenSchema();

mongoose.model('Token', tokenSchema);

module.exports = TokenSchema;
