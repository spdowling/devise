'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./base');

// when it coems to defining permissions, we can set resource and permission to * as a wildcard marker
// this implies that we can then do everything to every resource
// right now that's equivalent to just a 'write' permission, but could in the future be more specific.

// ideally, we would be able to (in a more modular fashion) define waht permissions map to what actions as well
// so that we can say PUT = update and GET = read for example
function RoleSchema() {
  return new BaseSchema({
    name: {
      type: String,
      required: true
    },
    permissions: [{
      resource: {
        type: String,
        required: true
      },
      permission: {
        type: String,
        required: true
      }
    }]
  });
}
var roleSchema = new RoleSchema();

mongoose.model('Role', roleSchema);

module.exports = RoleSchema;

// { name: 'read only', permissions: { resource: 'instances', permission: 'read' }}