'use strict';

var mongoose = require('mongoose');

// according to a guideline, we can say that any particular controller should support an OPTIONS call.
// we can also say that PUT updates an entire object, but PATCH is possible if we want to update just certain
// attributes of a resource item.
// What about HEAD as well?

// EXPRESS-RESOURCE-NEW DOESN'T SUPPORT PATCH, WHEREAS EXPRESS-RESOURCE DOES!

// an interesting point made in the tm forum restful api design spec:
// imagine we can fire off a configuration, to set a specific listener for events
// so in the case that we want to trigger some workflow related action to an external system
// we can define it as an event and then call off to that particular listener or listeners
// to notify them of an action

// this is actually a really neat idea and gets around having to configure directly
// instead we can manage that through the API as well. Brilliant!
module.exports = {
  options: {
    name: 'events',
    id: 'eventId'
  },
  all: function(req, res, next) {
    next();
  },
  // GET    /jobs/:jobId/events - Show me all events associated to this job identified by :jobId
  index: function(req, res) {
    var Job = mongoose.model('Job');

    Job.load(req.params.jobId, function(err, job) {
      if (err) return res.json(500, err);
      if (!job) return res.json(500, new Error('Failed to load job '+req.params.jobId+'.'));

      return res.json(job.workflow.states);
    });
  },
  // GET    /jobs/:jobId/events/:eventId - Show me the event identified by :eventId
  show: function(req, res) {
    var Job = mongoose.model('Job');
    
    Job.load(req.params.jobId, function(err, job) {
      if (err) return res.json(500, err);
      if (!job) return res.json(500, new Error('Failed to load job '+req.params.jobId+'.'));

      // we need to come up with a better response structure than this
      // ideally soemthing that explains the job, the states and the associated actions
      return res.json(job.workflow.states);
    });
  },
  // POST   /jobs/:jobId/events - Create an event from req.body
  create: function(req, res) {
    var Job = mongoose.model('Job');
    
    Job.findById(req.params.jobId, function(err, job) {
      if (err) return res.json(500, err);
      if (!job) return res.json(500, new Error('Failed to load job '+req.params.jobId+'.'));

      job.triggerEvent(req.body.event, function() {
        // not sure what to return here as a note of success tha the event triggered correctly.
        res.send(200,'Done, thank you!');
      });
    });
  }
};