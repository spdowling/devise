'use strict';

var mongoose = require('mongoose');

module.exports = {
  options: {
    name: 'workflows',
    id: 'workflowId'
  },
  all: function(req, res, next) {
    next();
  },
  // GET    /workflows - Show me all workflows
  // GET    /instances/:instanceId/workflows - Show me all workflows compatible with instance identified by :instanceId
  index: function(req, res) {
    if (!req.params.instanceId) {
      var Workflow = mongoose.model('Workflow');

      Workflow.all(function(err, workflows) {
        if (err) return res.json(500, err);
        if (!workflows) return res.json(500, new Error('Failed to load workflows.'));

        return res.json(workflows);
      });
    } else {
      return res.json(500);
      // we should have the instance context in mind here.
    }
  },
  // GET    /workflows/:workflowId - Show me the workflow identified by :workflowId
  show: function(req, res) {
    var Workflow = mongoose.model('Workflow');
    
    Workflow.load(req.params.workflowId, function(err, workflow) {
      if (err) return res.json(500, err);
      if (!workflow) return res.json(500, new Error('Failed to load workflow '+req.params.workflowId+'.'));

      return res.json(workflow);
    });
  },
  // POST   /workflows - Create a workflow from req.body  
  create: function(req, res) {
    if (!req.params.instanceId) {
      var Workflow = mongoose.model('Workflow');
      var model = new Workflow(req.body);

      model.save(function(err) {
        if (err) return res.json(500, err);

        return res.json(model);
      });
    } else {
      return res.json(405);
    }
  },
  // PUT    /workflows/:workflowId - Update workflow identified by :workflowId from req.body
  update: function(req, res) {
    if (!req.params.instanceId) {
      var Workflow = mongoose.model('Workflow');

      Workflow.load(req.params.workflowId, function(err, workflow) {
        if (err) return res.json(500, err);
        if (!workflow) return res.json(500, new Error('Failed to load workflow '+req.params.workflowId+'.'));

        // workflow = _.extend(workflow, req.body);
        
        workflow.save(function(err) {
          if (err) return res.json(500, err);

          return res.json(workflow);
        });
      });
    } else {
      return res.json(405);
    }
  },
  // DELETE /workflows/:workflowId - Delete workflow identified by :workflowId
  destroy: function(req, res) {
    if (!req.params.instanceId) {
      var Workflow = mongoose.model('Workflow');

      // When should we be allowed to delete or edit Workflows?
      // Should all workflows be versioned as well? To ensure consistency and back reference?
      // We are including the workflow in the job anyway, so technically the back reference already exists.
      Workflow.load(req.params.workflowId, function(err, workflow) {
        if (err) return res.json(500, err);
        if (!workflow) return res.json(500, new Error('Failed to load workflow '+req.params.workflowId+'.'));

        if (!workflow.hasInstances()) {
          workflow.remove(function(err) {
            if (err) return res.json(500, err);

            return res.json(workflow);
          });
        } else {
          return res.json(500, new Error('Unable to remove workflow '+req.params.workflowId+' due to job (instance) dependencies.'));
        }
      });
    } else {
      return res.json(405);
    }
  }
};
