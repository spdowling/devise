'use strict';

/**
 * We can assign either underscore or lodash for this require import. We are
 * starting out by using underscore for no other reason that it's what we know.
 * Later down the line we can replace this as required.
 */
var _ = require('underscore');

/**
 * Sorting enabling middleware.
 * 
 * This will attempt to assign a value to request.sorting that identifies
 * paths within a Mongoose schema that should be used to sort the matching
 * query result set.
 * 
 * A user can provide sorting query string parameters to any collection
 * resource URL, but not for any individual resource URL.
 *
 * The query string parameter takes the form:
 *
 * ?sort=path,-anotherPath
 *
 * OR
 *
 * ?sort=path&sort=anotherPath
 * 
 * @param  {Object} opt Options that can be passed to this middleware. The only
 *                      currently supported option would be to pass a different
 *                      name for the query parameter to look for. By default
 *                      we will continue to use 'sort'.
 */
module.exports = function (opt) {
  opt = opt || {};

  /*
    Currently this will prioritise the headers over the URL Querystring
    Parameters
   */
  return function (req, res, next) {
    var header = req.header('Range');

    if (header) {
      var matches = header.match(/(.*)=(\d*)-(\d*)/);
      var resource = _.last(_.without(_.map(req.path.split('/'), function(part) {
        return (part.match(/[0-9a-fA-F]{24}/)) ? ':param' : part;
      }), ':param'));

      if (!res.locals.mongoose) res.locals.mongoose = {};

      if (resource === matches[0]) {
        if (matches[2]) res.locals.mongoose.limit = matches[2];
        if (matches[1]>0) res.locals.mongoose.skip = matches[1];
      }
    } else {
      if (!res.locals.mongoose) res.locals.mongoose = {};

      if (req.query.limit) res.locals.mongoose.limit = req.query.limit;
      if (req.query.skip && req.query.skip>0) res.locals.mongoose.skip = req.query.skip;
    }

    next();
  };
};
