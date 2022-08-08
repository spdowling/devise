'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./base');

// Right now we are saying that we support the concept of clients...
// but from what I've already seen the architecture we are moving towards promotes the concept
// of a subscriber model where external systems have an endpoint we trigger. for this reason, do we need
// to track different client types? the client types right now seem just to be linked to our own internal
// applications.... that isn't necessarily a problem and to be fair, there may be cases in the future where
// we want a tighter integration such as a client attempting to develop on top of our API and requiring
// permission to access our authorization logic as defined using the client schema below so that we can be sure
// that we are providing the necessary lock-in and effective value of a highly integratable piece of software
// whether that is to internal apps or to 3rd party apps. We should be comfortable providing access to both and
// meeting the needs of the use cases identified in all
function ClientSchema() {
  return new BaseSchema({
    name: {
      type: String,
      unique: true,
      required: true,
    },
    clientId: {
      type: String,
      unique: true,
      required: true
    },
    clientSecret: {
      type: String,
      required: true
    }
  });
}

var clientSchema = new ClientSchema();

clientSchema.methods.authenticate = function(clientSecret) {
  return clientSecret === this.clientSecret;
};

mongoose.model('Client', clientSchema);

module.exports = ClientSchema;
