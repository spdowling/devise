'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./base'),
    crypto = require('crypto');

function UserSchema() {
  return new BaseSchema({
    email: {
      type: String,
      required: true
    },
    username: {
      type: String,
      unique: true,
      required: true
    },
    salt: {
      type: String
    },
    hashed: {
      type: String
    },
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }]
  });
}
var userSchema = new UserSchema();

userSchema.virtual('password').set(function(password) {
  this.salt = this.makeSalt();
  this.hashed = this.encrypt(password, this.salt);
});

userSchema.methods.authenticate = function(password) {
  return this.encrypt(password, this.salt) === this.hashed;
};

userSchema.methods.makeSalt = function() {
  return crypto.randomBytes(16).toString('base64');
};

userSchema.methods.encrypt = function(password, salt) {
  var saltBuffer = new Buffer(salt, 'base64');
  return crypto.pbkdf2Sync(password, saltBuffer, 10000, 64).toString('base64');
};

mongoose.model('User', userSchema);

module.exports = UserSchema;
