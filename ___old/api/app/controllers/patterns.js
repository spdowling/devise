'use strict';

var mongoose = require('mongoose'),
    _ = require('underscore'),
    authorization = require('../../config/authorization');

module.exports = {
  options: {
    name: 'patterns',
    id: 'patternId'
  },
  all: [authorization],
  // GET    /patterns - Show me all patterns
  index: function(req, res) {
    var Pattern = mongoose.model('Pattern');

    Pattern.all(res.locals.mongoose, function(err, patterns) {
      if (err) return res.send(500);

      return res.json(patterns);
    });
  },
  // GET    /patterns/:id - Show me the pattern identified by :patternId
  show: function(req, res) {
    var Pattern = mongoose.model('Pattern');
    
    Pattern.load(req.params.patternId, res.locals.mongoose, function(err, pattern) {
      if (err) return res.json(500, err);
      if (!pattern) return res.json(500, { message: 'Failed to load pattern '+req.params.patternId+'.' });
      
      return res.json(pattern);
    });
  },
  // POST   /patterns - Create a pattern from req.body
  create: function(req, res) {
    var Pattern = mongoose.model('Pattern');
    var newPatternSchema;

    if (req.body.parent) {
      Pattern.load(req.body.parent, res.locals.mongoose, function(err, pattern) {
        if (err) return res.json(500, err);
        if (!pattern) return res.json(500, { message: 'Unable to find Pattern identified by '+req.body.parent+'.' });

        req.body.parent = pattern;

        try {
          newPatternSchema = new mongoose.Schema(req.body.definition);
        } catch (err) {
          return res.json(400, { message: 'invalid schema, yo!', description: err.message });
        }

        if (newPatternSchema) {
          req.body.ancestors = (pattern.ancestors || []);
          req.body.ancestors.push(req.body.parent);
          
          var model = new Pattern(req.body);
          
          model.save(res.locals.auth, function(err) {
            if (err) return res.json(500, err);

            return res.json(model);
          });
        }
      });
    } else {
      try {
        newPatternSchema = new mongoose.Schema(req.body.definition);
      } catch (err) {
        return res.json(400, { message: 'invalid schema, yo!', description: err.message });
      }

      if (newPatternSchema) {          
        var model = new Pattern(req.body);
        
        model.save(res.locals.auth, function(err) {
          if (err) return res.json(500, err);

          return res.json(model);
        });
      }
    }
  },
  // PUT    /patterns/:id - Update pattern identified by :patternId from req.body

  // if we want to do a put vs a patch... how does this work?
  // looks like we basically manage that by extending an existing item if it's a patch...
  // whereas a full PUT update is replacing the whole item.
  update: function(req, res) {
    var Pattern = mongoose.model('Pattern');
    Pattern.load(req.params.patternId, res.locals.mongoose, function(err, pattern) {
      if (err) return res.json(500, err);
      if (!pattern) return res.json(500, new Error('Failed to load pattern '+req.params.patternId+'.'));

      // this kind of does both put and patch in one.
      // if we provide a couple of details, then it'll just replace those
      // if we replace all of it, it all gets replaced
      // so we could technically map a PATCH verb to the same update function here.
      // just so we support it.
      pattern = _.extend(pattern, req.body);
      
      pattern.save(res.locals.auth, function(err) {
        if (err) return res.json(500, err);

        return res.json(pattern);
      });
    });
  },
  // DELETE /patterns/:id - Delete pattern identified by :patternId
  destroy: function(req, res) {
    var Pattern = mongoose.model('Pattern');
    Pattern.load(req.params.patternId, function(err, pattern) {
      if (err) return res.json(500, err);
      if (!pattern) return res.json(500, { message: 'Failed to load pattern '+req.params.patternId+'.' });

      // let's see if we have any instances here....
      pattern.hasInstances(function(err, result) {
        if (err) return res.json(500, err);

        if (!result) {
          pattern.remove(function(err) {
            if (err) return res.json(500, err);

            return res.json(pattern);
          });
        } else {
          return res.json(500, { message: 'Unable to remove pattern '+req.params.patternId+' due to instance dependencies.' });
        }
      });
    });
  }
};
