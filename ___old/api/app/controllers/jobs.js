'use strict';

var mongoose = require('mongoose');

// we want to hide methods here that should not be affected by workflow or instance
module.exports = {
  options: {
    name: 'jobs',
    id: 'jobId'
  },
  all: function(req, res, next) {
    next();
  },
  // GET    /jobs - Show me all jobs
  // GET    /instances/:instanceId/jobs - Show me all jobs associated to instance identified by :instanceId
  // GET    /workflows/:workflowId/jobs - Show me all jobs as instances of a workflow identified by :workflowId
  index: function(req, res) {
    var Job = mongoose.model('Job');

    if (!req.params.instanceId) {
      if (!req.params.workflowId) {
        Job.all(function(err, jobs) {
          if (err) return res.json(500, err);
          if (!jobs) return res.json(500, new Error('Failed to load jobs.'));

          return res.json(jobs);
        });
      } else {
        Job.find({ workflow: { _id: req.params.workflowId } }, function(err, jobs) {
          if (err) return res.json(500, err);
          if (!jobs) return res.json(500, new Error('Failed to load jobs based on workflow '+req.params.workflowId+'.'));

          return res.json(jobs);
        });
      }
    } else {
      var collection = mongoose.connection.collections.instances.collection;
      req.params.instanceId = new require('mongodb').ObjectID(req.params.instanceId);

      collection.findOne({ _id: req.params.instanceId }, function(err, instance) {
        if (err) return res.json(500, err);
        if (!instance) return res.json(500, new Error('Failed to load instance '+req.params.instanceId+'.'));
        
        return res.json(instance.jobs);
      });
    }
  },
  // GET    /jobs/:jobId - Show me the job identified by :jobID
  show: function(req, res) {
    if (!req.params.instanceId && !req.params.workflowId) {
      var Job = mongoose.model('Job');
      console.log(req.params);
      Job.load(req.params.jobId, function(err, job) {
        if (err) return res.json(err);

        return res.json(job);
      });
    } else {
      return res.json(405);
    }
  },
  // POST   /jobs - Create a job from req.body, identifying the instance to assign to
  // POST   /instances/:instanceId/jobs - Create a job from req.body, with the instance identified by :instanceId
  create: function(req, res) {
    if (!req.params.workflowId) {
      if (!req.params.instanceId) {
        if (!req.body.instance) return res.json(500, new Error('Missing instance identifier in request.'));
        
        req.params.instanceId = req.body.instance;
      }

      var collection = mongoose.connection.collections.instances.collection;
      req.params.instanceId = new require('mongodb').ObjectID(req.params.instanceId);

      collection.findOne({ _id: req.params.instanceId }, function(err, instance) {
        if (err) return res.json(500, err);
        if (!instance) return res.json(500, new Error('Failed to load instance '+req.params.instanceId+'.'));
                
        var Job = mongoose.model('Job');
        var model = new Job(req.body);

        model.save(function(err) {
          if (err) return res.json(500, err);

          return res.json(200, 'TODO: we need to attach this to the instance now as well.');
        });
      });
    } else {
      return res.json(405);
    }
  },
  // PUT    /jobs/:jobId - Update job identified by :jobId
  update: function(req, res) {
    if (!req.params.instance && !req.params.workflowId) {
      var Job = mongoose.model('Job');

      Job.load(req.params.jobId, function(err, job) {
        if (err) return res.json(500, err);
        if (!job) return res.json(500, new Error('Failed to load job '+req.params.jobId+'.'));

        // job = _.extend(job, req.body);
        
        job.save(function(err) {
          if (err) return res.json(500, err);

          return res.json(job);
        });
      });
    } else {
      return res.json(405);
    }
  },
  // DELETE /jobs/:jobId - Delete (cancel) job identified by :jobId
  destroy: function(req, res) {
    if (!req.params.instanceId && !req.params.workflowId) {
      var Job = mongoose.model('Job');

      Job.load(req.params.jobId, function(err, job) {
        if (err) return res.json(500, err);
        if (!job) return res.json(500, new Error('Failed to load job '+req.params.jobId+'.'));

        if (job.isRunning()) {
          return res.json(500, new Error('Unable to delete job '+req.params.jobId+' in a running state.'));
        } else {
          job.remove(function(err) {
            if (err) return res.json(500, err);

            return res.json(job);
          });
        }
      });
    } else {
      return res.json(405);
    }
  }
};
