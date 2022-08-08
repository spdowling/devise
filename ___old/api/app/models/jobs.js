'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./base'),
    Stately = require('stately');

function JobSchema() {
  return new BaseSchema({
    workflow: {
      type: mongoose.Schema.Types.ObjectId
    },
    status: {
      started: {
        type: Date,
        required: true,
        default: Date.now
      },
      completed: {
        type: Date
      },
      state: {
        type: String,
        enum: ['Pending', 'Running', 'Success', 'Error', 'Canceled'],
        required: true,
        default: 'Pending'
      }
    },
    nodes: [{
      node_id: {
        type: String,
        required: true
      },
      started: {
        type: Date
      },
      completed: {
        type: Date
      },
      state: {
        type: String,
        enum: ['Active', 'Waiting', 'Pending', 'Success', 'Error', 'Canceled'],
        required: true,
        default: 'Pending'
      },
    }]
  });
}
var jobSchema = new JobSchema();

jobSchema.virtual('statemachine').get(function() {
  var stateLogic = function() { };

  var stateObject = {};

  // how do we know we have a workflow object?
  this.workflow.forEach(function (err, state) {
    // stateobject should be an actual object
    stateObject[state.name] = stateLogic;
  });

  var machine = new Stately(stateObject).bind(function (event, oldState, newState) {
    // this bind allows us to trigger notifications or apply callback hooks
    console.log('inside of an event bind: '+oldState+' - '+newState+'.');
    // we need to trigger this through to our notification engine
    // the notification engine is effectively the external push or broadcast for
    // workflow events so that we can integrate by hosting a service
    // as SOAP, REST and also allow for socket.io as well
    // so we can identify or configure the correct host information
    // and we will notify that endpoint on an event
    // whether we are tracking a certain type of event for a certain workflow
    // or if we are catching all events, it must be possible to identify
    // so from the event, we can track what the event was...

    // in the launch scenario, we would typically have it supporting async access and waiting before moving to the next state
    // in our case, we probably want to include additional actions or events for publishing, so that we can trigger the proper
    // finish of that process and mark it as published. It's similar, we are just telling the service in a different way
        
    // event: the triggering event that caused the change
    // old: the old identifiable state
    // new: the new identifiable state
  });

  return machine;
});

// Let's tell the job that we want to trigger an event 
jobSchema.methods.triggerEvent = function triggerEvent(event, cb) {
  // should probably attempt to validate whether this event is applicable to this particular job.
  // if needed we could pass additional arguments easily as well
  this.statemachine[event]();
  cb();
};

jobSchema.methods.isRunning = function isRunning(cb) {
  cb(false);
};

mongoose.model('Job', jobSchema);

module.exports = JobSchema;