'use strict';

var mongoose = require('mongoose');

// we need a queue to manage messages out to each listener
// this message queue will need failure tracking
// we already have a workflow and job concept, so perhaps we jsut need to extend that?
// the listeners are still valid as a set of resources though
module.exports = {
  options: {
    name: 'listeners',
    id: 'listenerId'
  },
  // GET    /listeners - index
  index: function(req, res) {
    var Listener = mongoose.model('Listener');

    Listener.all(function(err, listeners) {
      if (err) return res.json(500, err);
      if (!listeners) return res.json(500, new Error('Failed to load listeners.'));

      return res.json(listeners);
    });
  },
  // GET    /listeners/:listenerId - show
  show: function(req, res) {
    var Listener = mongoose.model('Listener');
    
    Listener.load(req.params.listenerId, function(err, listener) {
      if (err) return res.json(500, err);
      if (!listener) return res.json(500, new Error('Failed to load listener '+req.params.listenerId+'.'));

      return res.json(listener);
    });

  },
  // POST   /listeners - create
  create: function(req, res) {
    var Listener = mongoose.model('Listener');
    var model = new Listener(req.body);

    model.save(function(err) {
      if (err) return res.json(500, err);

      return res.json(model);
    });
  },
  // PUT    /listeners/:listenerId - update
  update: function(req, res) {
    var Listener = mongoose.model('Listener');

    Listener.load(req.params.listenerId, function(err, listener) {
      if (err) return res.json(500, err);
      if (!listener) return res.json(500, new Error('Failed to load listener '+req.params.listenerId+'.'));

      // listener = _.extend(listener, req.body);
      
      listener.save(function(err) {
        if (err) return res.json(500, err);

        return res.json(listener);
      });
    });
  },
  // DELETE /listeners/:listenerId - destroy
  destroy: function(req, res) {
    var Listener = mongoose.model('Listener');

    Listener.load(req.params.listenerId, function(err, listener) {
      if (err) return res.json(500, err);
      if (!listener) return res.json(500, new Error('Failed to load listener '+req.params.listenerId+'.'));

      if (!listener.hasInstances()) {
        listener.remove(function(err) {
          if (err) return res.json(500, err);

          return res.json(listener);
        });
      } else {
        return res.json(500, new Error('Unable to remove listener '+req.params.listenerId+' due to job (instance) dependencies.'));
      }
    });
  }
};
