'use strict';

var mongoose = require('mongoose'),
// change this to lib? might be a good idea.
    authorization = require('../../config/authorization');

module.exports = {
  options: {
    name: 'instances',
    id: 'instanceId'
  },
  all: [authorization],
  // GET    /instances - Show me all instances
  // GET    /patterns/:patternId/instances - Show me all instances utilizing this pattern
  // GET    /workflows/:workflowId/instances - Show me all instances utilizing this workflow
  index: function(req, res) {
    var Instance = mongoose.model('Instance');
    // is there some way we can pass the user into a save or something?
    if (!req.params.patternId) {
      if (!req.params.workflowId) {
        Instance.all(res.locals.mongoose, function(err, instances) {
          if (err) return res.send(500);

          return res.json(instances);
        });
      } else {
        // TODO: Instance.findByWorkflowId
        Instance.find({ 'jobs.workflow.type': req.params.workflowId }, function(err, items) {
          if (err) return res.send(500);

          res.json(items);
        });
      }
    } else {
      Instance.findByPatternId(req.params.patternId, function(err, instances) {
        if (err) return res.send(500);

        return res.json(instances);
      });
    }
  },
  // GET    /instances/:instanceId - Show me the instance identified by :instanceId
  show: function(req, res) {
    if (!req.params.patternId && !req.params.workflowId) {
      var Instance = mongoose.model('Instance');

      Instance.load(res.locals.mongoose, req.params.instanceId, function(err, instance) {
        if (err) return res.send(500);

        return res.json(instance);
      });
    } else {
      return res.send(405);
    }
  },
  // POST   /instances - Create an instance from req.body, identifying the pattern to use
  // POST   /patterns/:patternId/instances - Create an instance from req.body, with the pattern identified by :patternId
  create: function(req, res) {
    if (!req.params.workflowId) {
      if (!req.params.patternId) {
        if (!req.body.pattern) return res.json(400, { message: 'Missing pattern identifier in request.' });
        
        req.params.patternId = req.body.pattern;
      }

      var Instance = mongoose.model('Instance');

      Instance.create(req.params, function(err, instance) {
        if (err) return res.send(500);

        return res.json(instance);
      });
    } else {
      return res.send(405);
    }
  },
  // PUT    /instances/:instanceId - Update instance identified by :instanceId from req.body
  update: function(req, res) {
    if (!req.params.patternId && !req.params.workflowId) {
      var Instance = mongoose.model('Instance');

      Instance.update(req.params.instanceId, req.body, function(err, instance) {
        if (err) return res.send(500);

        return res.json(instance);
      });
    } else {
      return res.send(405);
    }
  },
  // DELETE /instances/:instanceId - Delete instance identified by :instanceId
  destroy: function(req, res) {
    if (!req.params.patternId && !req.params.workflowId) {
      var Instance = mongoose.model('Instance');

      Instance.destroy(req.params.instanceId, function(err, instance) {
        if (err) return res.send(500);

        return res.json(instance);
      });
    } else {
      return res.send(405);
    }
  }
};
