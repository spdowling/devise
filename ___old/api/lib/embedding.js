'use strict';

// this and all the other library utilities should be used as part of a middleware that links in with the mongoose plugin
// technically may be easier to make changes from our controller middleware by assuming we have access to
// mongoose than trying to do it directly on both the connect middleware and on the model middleware
// how would that look?
// 
// We'd have express middleware which then would be looking for mongoose. Once we were sure we had mongoose
// and it was currently loaded correctly, we could then attempt to adjust the base schema... that relies on us knowing
// the base schema or at least knowing the way we manage resources
// 
// we want to ensure we have the options loaded properly to use in any load mechanism
// can we overload the find or find by ?
// so when we go to call find, we already have the applicable filtering and options?
// 
// 

/**
 * We can assign either underscore or lodash for this require import. We are
 * starting out by using underscore for no other reason that it's what we know.
 * Later down the line we can replace this as required.
 */
var _ = require('underscore');

/**
 * Embed enabling middleware.
 * 
 * This will attempt to assign a value to request.populate that is equivalent
 * to the value of the objects to populate when making a query to Mongoose.
 *
 * A user can call any of the collection or individual resource URLs providing
 * query string matching either:
 *
 * ?embed=path,path.subpath,anotherPath
 *
 * OR
 *
 * ?embed=path&embed=path.subpath&embed=anotherPath
 *
 * This parameter identifies one or more ObjectID references that we should
 * attempt to populate when making the query associated to this URI.
 * 
 * @param  {Object} opt Options that can be passed to this middleware. The only
 *                      currently supported option would be to pass a different
 *                      name for the query parameter to look for. By default
 *                      we will continue to use 'embed'.
 */

module.exports = function (opt) {
  opt = opt || {};

  return function (req, res, next) {
    var param = req.query[opt.query || 'embed'];
    
    if (param) {
      var result;
      var populate;

      if (_.isString(param)) {
        var vals = param.split(',');
        populate = {};

        if (vals.length>1) {
          result = [];

          _.each(vals, function (element) {
            populate.path = element;
            result.push(populate);
          });
        } else {
          populate.path = vals[0];
          result = populate;
        }
      } else if (_.isArray(param)) {
        result = [];

        _.each(param, function (element) {
          var parts = element.split(',');
          populate = {};
          
          _.each(parts, function (element) {
            populate.path = element;
            result.push(populate);
          });
        });
      }

      if (result) {
        if (!res.locals.mongoose) res.locals.mongoose = {};

        res.locals.mongoose.populate = result;
      }
    }
    
    next();
  };
};

// express-mongoose-query