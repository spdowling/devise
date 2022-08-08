'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./base');

// we might want to consider specific actions or events to perform oncancel and onerror..
// each state could have an additional data packet which can contain relevant information
// for a particular run. so we might say that this is a data input type state
// in which case we can attach an additional data attribute to the job to store the input.
function WorkflowSchema() {
  return new BaseSchema({
    name: { // should be unique ?
      type: String,
      required: true
    },// this can also be called chain instead of states if we like ... or steps
    states: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['Activity', 'Task'],
        required: true
      },
      // trigger an action called NAME which forces a change to STATE
      // do we need to identify the type of action we're taking? not yet.
      // in the future, we might be able to adjust the action to include a payload of some kind of data
      // hey presto, we can do more in the action
      // we shouldn't need to do anything else here...
      events: [{
        name: {
          type: String,
          required: true
        },
        state: {
          type: String,
          required: true
        }
      }]
    }],
    type: {
      type: String
    }
  });
}
var workflowSchema = new WorkflowSchema();

mongoose.model('Workflow', workflowSchema);

module.exports = WorkflowSchema;
